import { expect as expectCDK, matchTemplate, MatchStyle, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import CorrettoYumRepository = require('../lib/corretto_yum_repository-stack');

test("S3 buckets are not public accessible ", () => {
  const app = new cdk.App();

  const stack = new CorrettoYumRepository.CorrettoYumRepositoryStack(app, "MyTestStack");

  expectCDK(stack).to(
    haveResource("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    })
  );
});

test("S3 buckets are encrypted ", () => {
  const app = new cdk.App();

  const stack = new CorrettoYumRepository.CorrettoYumRepositoryStack(app, "MyTestStack");

  expectCDK(stack).to(
    haveResource("AWS::S3::Bucket", {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: "AES256",
            },
          },
        ],
      },
    })
  );
});
