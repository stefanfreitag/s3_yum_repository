import * as cdk from "@aws-cdk/core";
import {
  Role,
  Policy,
  PolicyStatement,
  ManagedPolicy,
  ServicePrincipal
} from "@aws-cdk/aws-iam";
import { Bucket, BlockPublicAccess } from "@aws-cdk/aws-s3";
import { CfnOutput } from "@aws-cdk/core";
export class CorrettoYumRepositoryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * S3 bucket used to "host" the repository
     */
    const bucket: Bucket = new Bucket(this, "CorrettoS3Bucket", {
    //  blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    });

    bucket.grantPublicAccess();
   
    /**
     * Define policy for resource access
     */
    const statement_1: PolicyStatement = new PolicyStatement({
      actions: ["s3:GetObject", "s3:ListBucket", "s3:GetBucketLocation"],
      resources: [bucket.bucketArn]
    });

    const statement_2: PolicyStatement = new PolicyStatement({
      actions: ["s3:GetObject"],
      resources: [bucket.bucketArn + "/*"]
    });

    const policy: Policy = new Policy(this, "CorrettoS3BucketPolicy", {});
    policy.addStatements(statement_1, statement_2);

    const role: Role = new Role(this, "s3_repository_role", {
      assumedBy: new ServicePrincipal("s3.amazonaws.com"),
      roleName: "yum-repository-role"
    });
    policy.attachToRole(role);
    
    new cdk.CfnOutput(this, "Bucket name", { value: bucket.bucketName });

  }
}
