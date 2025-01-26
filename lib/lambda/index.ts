import { CloudFormationCustomResourceEvent, Handler } from "aws-lambda";
import {
  DynamoDBClient,
  ResourceNotFoundException,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  PutCommandInput,
  DeleteCommand,
  DeleteCommandInput,
  GetCommand,
  GetCommandInput,
} from "@aws-sdk/lib-dynamodb";

interface PutItemLambdaProps {
  tableName: string;
  playerId: string;
  level: number;
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function sendResponse(
  event: CloudFormationCustomResourceEvent<PutItemLambdaProps>,
  status: string,
  reason: string | null
): Promise<void> {
  console.log("sendResponse: ", event, status, reason);

  const physicalResourceId = (() => {
    switch (event.RequestType) {
      case "Create":
        return event.LogicalResourceId;
      case "Update":
      case "Delete": {
        return event.PhysicalResourceId;
      }
    }
  })();

  const responseBody = JSON.stringify({
    Status: status,
    Reason: reason,
    PhysicalResourceId: physicalResourceId,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
  });

  const result = await fetch(event.ResponseURL, {
    method: "PUT",
    body: responseBody,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": responseBody.length.toString(),
    },
  });

  console.log(result);
}

const handleCreate = async (
  event: CloudFormationCustomResourceEvent<PutItemLambdaProps>
) => {
  const props = event.ResourceProperties as PutItemLambdaProps;

  const waitResult = await waitUntilTableExists(
    { client: client, maxWaitTime: 60 },
    { TableName: props.tableName }
  );

  console.log("wait result: ", waitResult);

  if (waitResult.state !== "SUCCESS") {
    throw new Error(waitResult.reason);
  }

  const command = new PutCommand({
    TableName: props.tableName,
    Item: {
      PlayerId: props.playerId,
      Level: Number(props.level),
    },
  } as PutCommandInput);

  await docClient.send(command);
};

const handleDelete = async (
  event: CloudFormationCustomResourceEvent<PutItemLambdaProps>
) => {
  const props = event.ResourceProperties as PutItemLambdaProps;

  const input = {
    TableName: props.tableName,
    Key: {
      PlayerId: props.playerId,
      Level: Number(props.level),
    },
  };

  const getCommand = new GetCommand(input as GetCommandInput);
  await docClient
    .send(getCommand)
    .then(async () => {
      const deleteCommand = new DeleteCommand(input as DeleteCommandInput);
      await docClient.send(deleteCommand);
    })
    .catch((error: ResourceNotFoundException) => {
      console.log("Item not found: ", error.message);
    });
};

export const handler: Handler = async (
  event: CloudFormationCustomResourceEvent<PutItemLambdaProps>
): Promise<void> => {
  console.log(event);
  try {
    switch (event.RequestType) {
      case "Create": {
        console.log("RequestType: Create");
        await handleCreate(event);
        await sendResponse(event, "SUCCESS", "TableItem successfully created.");
        break;
      }
      case "Update": {
        console.log("RequestType: Update");
        await sendResponse(event, "SUCCESS", "Update not implemented.");
        break;
      }
      case "Delete": {
        console.log("RequestType: Delete");
        await handleDelete(event);
        await sendResponse(event, "SUCCESS", "TableItem successfully deleted.");
        break;
      }
    }
  } catch (error: any) {
    console.error("Error: ", error);
    await sendResponse(event, "FAILED", error.message);
  }
};
