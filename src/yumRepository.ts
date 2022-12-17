import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import {
  Role,
  PolicyStatement,
  ManagedPolicy,
  ServicePrincipal,
  AnyPrincipal,
  Effect,
  CfnInstanceProfile,
} from 'aws-cdk-lib/aws-iam';
import {
  Bucket,
  BlockPublicAccess,
  BucketEncryption,
  BucketPolicy,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { YumRepositoryProperties } from './yumRepositoryProperties';

export class YumRepository extends Construct {
  constructor(
    scope: Construct,
    id: string,
    properties: YumRepositoryProperties,
  ) {
    super(scope, id);

    /**
     * S3 bucket used to "host" the repository
     */
    const bucket: Bucket = new Bucket(this, 'S3Bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const bucketContentStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:GetObject'],
      resources: [bucket.bucketArn + '/*'],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          'aws:SourceIp': properties.whitelist,
        },
      },
    });

    const bucketStatement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:ListBucket', 's3:GetBucketLocation'],
      resources: [bucket.bucketArn],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          'aws:SourceIp': properties.whitelist,
        },
      },
    });

    const bucketPolicy = new BucketPolicy(this, 'bucketPolicy', {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      bucketContentStatement,
      bucketStatement,
    );

    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:GetObject'],
      resources: [bucket.bucketArn + '/*'],
    });

    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:ListBucket', 's3:GetBucketLocation'],
      resources: [bucket.bucketArn],
    });

    const role = new Role(this, 'role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
      ],
    });
    const instance_profile = new CfnInstanceProfile(this, 'instanceProfile', {
      roles: [role.roleName],
    });

    bucket.grantReadWrite(role);

    new CfnOutput(this, 'Bucket name', { value: bucket.bucketName });
    new CfnOutput(this, 'Instance Profile ARN', {
      value: instance_profile.attrArn,
    });
  }
}
