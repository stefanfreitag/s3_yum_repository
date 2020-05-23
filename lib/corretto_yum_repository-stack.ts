import * as cdk from "@aws-cdk/core";
import {
  Role,
  Policy,
  PolicyStatement,
  ManagedPolicy,
  ServicePrincipal,
  AnyPrincipal,
  Effect,
  ArnPrincipal
} from "@aws-cdk/aws-iam";
import {
  Bucket,
  BlockPublicAccess,
  BucketEncryption,
  BucketPolicy
} from "@aws-cdk/aws-s3";
import { CfnOutput, RemovalPolicy, CfnCondition } from "@aws-cdk/core";
export class CorrettoYumRepositoryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * S3 bucket used to "host" the repository
     */
    const bucket: Bucket = new Bucket(this, "CorrettoS3Bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      versioned: false
    });

    const bucketContentStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject"],
      resources: [bucket.bucketArn + "/*"],
      principals: [new AnyPrincipal()]
    });
    bucketContentStatement.addCondition("IpAddress", {
      "aws:SourceIp": "87.122.210.145/32"
    });

    const bucketStatement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket" , "s3:GetBucketLocation" ],
      resources: [bucket.bucketArn],
      principals: [new AnyPrincipal()]
    });
    bucketStatement.addCondition("IpAddress", {
      "aws:SourceIp": "87.122.210.145/32"
    });

    const bucketPolicy = new BucketPolicy(this, "bucketPolicy", {
      bucket: bucket, 
    });
    
    bucketPolicy.document.addStatements(
      bucketContentStatement,
      bucketStatement
    );

    new cdk.CfnOutput(this, "Bucket name", { value: bucket.bucketName });
  }
}
