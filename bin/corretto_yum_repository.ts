#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { YumRepositoryStack } from '../lib/corretto_yum_repository-stack';

const app = new cdk.App();
new YumRepositoryStack(app, 'YumRepositoryStack', {
    whitelist: ["87.123.60.75/32"]
});
