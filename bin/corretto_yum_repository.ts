#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CorrettoYumRepositoryStack } from '../lib/corretto_yum_repository-stack';

const app = new cdk.App();
new CorrettoYumRepositoryStack(app, 'CorrettoYumRepositoryStack');
