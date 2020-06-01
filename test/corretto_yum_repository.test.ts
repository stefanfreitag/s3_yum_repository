import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
  haveResource,
  haveResourceLike,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import YumRepository = require("../lib/corretto_yum_repository-stack");

test("S3 buckets are not public accessible ", () => {
  const app = new cdk.App();

  const stack = new YumRepository.YumRepositoryStack(app, "MyTestStack", {
    whitelist: ["87.123.60.75/32"],
  });

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

  const stack = new YumRepository.YumRepositoryStack(app, "MyTestStack", {
    whitelist: ["87.123.60.75/32"],
  });

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

test("S3 bucket policy is setup", () => {
  const app = new cdk.App();

  const stack = new YumRepository.YumRepositoryStack(app, "MyTestStack", {
    whitelist: ["87.123.60.75/32"],
  });

  expectCDK(stack).to(
    haveResourceLike("AWS::S3::BucketPolicy", {
      PolicyDocument: {
        Statement: [
          {
            Action: "s3:GetObject",
            Effect: "Allow",
            Principal: "*"
          },
          {
            Action: ["s3:ListBucket", "s3:GetBucketLocation"],
            Effect: "Allow",
            Principal: "*"
          },
        ],
      },
    })
  );
});
