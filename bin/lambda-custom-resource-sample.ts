#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LambdaCustomResourceSampleStack } from '../lib/lambda-custom-resource-sample-stack';

const app = new cdk.App();
new LambdaCustomResourceSampleStack(app, 'LambdaCustomResourceSampleStack');