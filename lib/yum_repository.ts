import * as cdk from "@aws-cdk/core";
import {
  Role,
  Policy,
  PolicyStatement,
  ManagedPolicy,
  ServicePrincipal,
  AnyPrincipal,
  Effect,
  ArnPrincipal,
  CfnInstanceProfile,
} from "@aws-cdk/aws-iam";
import {
  Bucket,
  BlockPublicAccess,
  BucketEncryption,
  BucketPolicy,
} from "@aws-cdk/aws-s3";
import { CfnOutput, RemovalPolicy, CfnCondition } from "@aws-cdk/core";

export interface YumRepositoryProperties {
  readonly whitelist: Array<string>;
}

export class YumRepository extends cdk.Construct {
  constructor(
    scope: cdk.Construct,
    id: string,
    properties: YumRepositoryProperties
  ) {
    super(scope, id);

    /**
     * S3 bucket used to "host" the repository
     */
    const bucket: Bucket = new Bucket(this, "S3Bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const bucketContentStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject"],
      resources: [bucket.bucketArn + "/*"],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          "aws:SourceIp": properties.whitelist,
        },
      },
    });

    const bucketStatement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket", "s3:GetBucketLocation"],
      resources: [bucket.bucketArn],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          "aws:SourceIp": properties.whitelist,
        },
      },
    });

    const bucketPolicy = new BucketPolicy(this, "bucketPolicy", {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      bucketContentStatement,
      bucketStatement
    );

    const ec2ContentStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject"],
      resources: [bucket.bucketArn + "/*"],
    });

    const ec2Statement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket", "s3:GetBucketLocation"],
      resources: [bucket.bucketArn],
    });

    const role = new Role(this, "role", {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
      ],
    });
    const instance_profile = new CfnInstanceProfile(this, "instanceProfile", {
      roles: [role.roleName],
    });

    bucket.grantReadWrite(role);

    new cdk.CfnOutput(this, "Bucket name", { value: bucket.bucketName });
    new cdk.CfnOutput(this, "Instance Profile ARN", {
      value: instance_profile.attrArn,
    });
  }
}
