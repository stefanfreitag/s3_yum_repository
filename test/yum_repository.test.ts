import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { YumRepository } from '../lib/yum_repository';

test('S3 buckets are not public accessible ', () => {
  const stack = new Stack();

  new YumRepository(stack, 'yum_repo', {
    whitelist: ['87.123.60.75/32'],
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::S3::Bucket', {
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  });
});

/**
test("S3 buckets are encrypted ", () => {
  const stack = new Stack();

  new YumRepository(stack, "yum_repo", {
    whitelist: ["87.123.60.75/32"],
  });
  const template = Template.fromStack(stack);

   template.hasResource("AWS::S3::Bucket", {
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
});
 */
/**
test("S3 bucket policy is setup", () => {
  const stack = new Stack();
  new YumRepository(stack, "yum_repo", {
    whitelist: ["87.123.60.75/32"],
  });
  const template = Template.fromStack(stack);


  template.hasResource("AWS::S3::BucketPolicy", {
      PolicyDocument: {
        Statement: [
          {
            Action: "s3:GetObject",
            Effect: "Allow",
            Principal: "*",
          },
          {
            Action: ["s3:ListBucket", "s3:GetBucketLocation"],
            Effect: "Allow",
            Principal: "*",
          },
        ],
      },
    })
});


test("IAM role is setup", () => {
  const stack = new Stack();
  new YumRepository(stack, "yum_repo", {
    whitelist: ["87.123.60.75/32"],
  });

  expectCDK(stack).to(
    haveResourceLike("AWS::IAM::Role", {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
          },
        ],
      },
    })
  );
});
*/