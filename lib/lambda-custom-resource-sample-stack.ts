import {
  CustomResource,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import {
  SingletonFunction,
  Architecture,
  Runtime,
  Code,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export class LambdaCustomResourceSampleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const gameTable = new Table(this, "GameTable", {
      partitionKey: {
        name: "PlayerId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "Level",
        type: AttributeType.NUMBER,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const putItemLambda = new SingletonFunction(this, "PutItemLambda", {
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: Code.fromAsset(path.join(__dirname, "lambda")),
      lambdaPurpose: "PutItemLambda",
      timeout: Duration.minutes(10),
      uuid: "7acd8116-b39b-463d-932c-2e61f824067b",
    });

    const grant = gameTable.grantReadWriteData(putItemLambda);

    const gameTableItem = new CustomResource(this, "GameTableItem", {
      serviceToken: putItemLambda.functionArn,
      serviceTimeout: Duration.minutes(5),
      resourceType: "Custom::GameTableItem",
      properties: {
        tableName: gameTable.tableName,
        playerId: "P000001",
        level: 1,
      },
    });

    gameTableItem.node.addDependency(grant);
  }
}
