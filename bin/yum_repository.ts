#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { YumRepository } from '../lib/yum_repository';
import { Stack } from '@aws-cdk/core';

const app = new cdk.App();
const stack = new Stack(app, "stack");
new YumRepository(stack, 'yum_repository', {
    whitelist: ["87.123.60.75/32"]
});
