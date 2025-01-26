# Lambda backed custom resource example with CDK

This repository contains an example project demonstrating how to use a Lambda-backed custom resource with AWS CDK. The example initializes data in a DynamoDB table during stack provisioning.

For a detailed explanation of this project, check out the accompanying blog post:\
[Lambda-Backed Custom Resource Example with CDK](https://qiita.com/wasashi/private/6708c9915ddf26ce6118)

<br>

## Clone the project
Clone the repository and navigate into the project directory:
```
git clone https://github.com/toru-iwasa/lambda-custom-resource-sample.git
cd lambda-custom-resource-sample
```

<br>

## Deploy the Stack
### 1. Install dependencies
Install dependencies for the root project and the Lambda function.
```
npm install && npm install --prefix lib/lambda
```

### 2. Compile the lambda function.
Compile the TypeScript Lambda function.
```
npm run build
```

### 3. Bootstrap Your AWS Account
If this is your first CDK project, bootstrap your AWS account.
```
cdk bootstrap
```

### 4. Deploy the Stack
Deploy the stack using the following command:
```
cdk deploy
```
<br>

## Clean up
### 1. Destroy the CDK Stack
To remove your cdk stack from your AWS account, run:
```
cdk destroy
```

### 2. Delete Retained Resources
The following resources are not automatically deleted when the stack is destroyed. You must remove them manually via the AWS Management Console:
Also, you have to remove these retained resources below via AWS console.
- DynamoDB Table: Navigate to the DynamoDB Console, select the table, and delete it.
- CloudWatch Log Group: Open the CloudWatch Console, find the Log Group created by the Lambda function (starts with `/aws/lambda/LambdaCustomResourceSampl-PutItemLambda...`), and delete it.
- CDK Toolkit CloudFormation Stack & S3 Bucket: If you no longer plan to use CDK, delete the `CDKToolkit` stack and the associated S3 bucket.)