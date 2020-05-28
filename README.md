<!-- markdownlint-disable MD013 -->
# YUM repository hosted in an AWS S3 bucket

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/35fc9af4fb4a492f8f4686469999b527)](https://app.codacy.com/manual/stefan_20/s3_yum_repository?utm_source=github.com&utm_medium=referral&utm_content=stefanfreitag/s3_yum_repository&utm_campaign=Badge_Grade_Settings) [![Mergify Status][mergify-status]][mergify]

## Disclaimer

>The idea of using an S3 bucket as YUM repository is not new. Several blog posts are available on the Internet.

We will use the [AWS Cloud Development Kit (CDK)](https://github.com/aws/aws-cdk) to setup the S3 bucket. By doing so we are following the Infrastructure-as-Code ([IaC](https://en.wikipedia.org/wiki/Infrastructure_as_code)) pattern.

To keep it simple, the repository for CentOS 8 is setup locally and then synced to the bucket using
the AWS CLI.

## Creating the YUM repository on localhost

Install the `createrepo` package and tools required at later stage

```shell
yum -y install createrepo wget
```

Create directory `s3_yum_repository`. It will hold the repository content

```shell
mkdir s3_yum_repository
```

By executing `createrepo ./s3_yum_repository` the directory is scanned and metadata
files generated.

```shell
$ createrepo ./s3_yum_repository
Directory walk started
Directory walk done - 0 packages
Temporary output repo path: ./s3_yum_repository/.repodata/
Preparing sqlite DBs
Pool started (with 5 workers)
Pool finished
```

The metadata is stored in the  `repodata` sub-directory

```shell
$ ls -1 s3_yum_repository/repodata
50da989dd2394a07472c95ad16876baef03e8b936a7ff20e8df393e51cc85c02-other.sqlite.bz2
54cde142e5b5449d2d94fac6b94b8ec96d0a18c813fcdd31b318bddded1d1f74-filelists.xml.gz
a7bb37a6ae126c74b873e11d90d28988a84be7d21f4fe0c5ba00fedad06bf54d-primary.xml.gz
abc202b95b85fdd9cf79dd4a2544b0d4d774e97bce42a41847488cfb45fbcb05-other.xml.gz
bd2ec9eb92cf7949610c0ed9dd52c065ccbe1ca02e704f29a7b0629bec6d3add-filelists.sqlite.bz2
f26b1897a3385e13b7376de0e1c87663dc2ddcd4532dd27004ac99d96c5e3d43-primary.sqlite.bz2
repomd.xml
```

Prepare the sub-directory structure

```shell
mkdir -p s3_yum_repository/{noarch,x86_64,SRPMS}
```

Only the `x86_64` folder will be used for storing our RPMs. Download the files of Adopt JDK & JRE as well as Corretto 11 JDK for this architecture.

```shell
wget https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/8/x86_64/Packages/adoptopenjdk-13-hotspot-13+33-1.x86_64.rpm
wget https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/8/x86_64/Packages/adoptopenjdk-13-hotspot-jre-13+33-1.x86_64.rpm
wget https://d3pxv6yz143wms.cloudfront.net/11.0.3.7.1/java-11-amazon-corretto-devel-11.0.3.7-1.x86_64.rpm
```

Move the files to the repository directory

```shell
mv ./adoptopenjdk-13-hotspot-13+33-1.x86_64.rpm  s3_yum_repository/x86_64
mv ./adoptopenjdk-13-hotspot-jre-13+33-1.x86_64.rpm  s3_yum_repository/x86_64
mv ./java-11-amazon-corretto-devel-11.0.3.7-1.x86_64.rpm s3_yum_repository/x86_64
```

Re-create the repository data

```bash
$ createrepo --update ./s3_yum_repository
Spawning worker 0 with 1 pkgs
Spawning worker 1 with 1 pkgs
Workers Finished
Saving Primary metadata
Saving file lists metadata
Saving other metadata
Generating sqlite DBs
Sqlite DBs complete
```

## Setup the S3 Bucket using AWS CDK

### Creating the bucket
  
The bucket will not contain any kind of sensitive data, so the encryption is turned off.
To restrict the access to the bucket the `blockPublicAccess` and `publicReadAccess` are explicitly listed.

```javascript
const bucket: Bucket = new Bucket(this, "CorrettoS3Bucket", {
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  encryption: BucketEncryption.UNENCRYPTED,
  publicReadAccess: false,
  removalPolicy: RemovalPolicy.DESTROY,
  versioned: false,
});
```

### Policy Statements

Two policy statements are set up to allow access to the bucket content from a specific
IP address (e.g. the one I got from my ISP). The first one defines who is allowed to read objects (in our case e.g. the RPM files)

```javascript
const bucketContentStatement = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ["s3:GetObject"],
  resources: [bucket.bucketArn + "/*"],
  principals: [new AnyPrincipal()],
  conditions: {
    IpAddress: {
      "aws:SourceIp": ["87.122.210.145/32"],
    },
  },
});

```

The second defines who is allowed to `list` the contents of the bucket

```javascript
const bucketStatement: PolicyStatement = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ["s3:ListBucket", "s3:GetBucketLocation"],
  resources: [bucket.bucketArn],
  principals: [new AnyPrincipal()],
  conditions: {
    IpAddress: {
      "aws:SourceIp": ["87.122.210.145/32"],
    },
  },
});
```

Both statements are added to the bucket policy

```javascript
const bucketPolicy = new BucketPolicy(this, "bucketPolicy", {
  bucket: bucket,
});

bucketPolicy.document.addStatements(
  bucketContentStatement, bucketStatement);
```

## Sync to AWS S3 Bucket

Synchronize the content of your local YUM repository to the S3 bucket

```shell
aws s3 sync --profile cdk s3_yum_repository s3://correttoyumrepositorysta-correttos3bucketbbeb0a25-1p908wuzpckvj  
```

## Testing

### Setup CentOS 8 environment

For the test a CentOS 8 virtual machine can be setup by

* Using the ISO image `CentOS-8.1.1911-x86_64-boot.iso` as starting point
* Choose _minimal setup_ to define the set of packages to install

Alternatively a Docker container can be used - this approach is the preferred  one.
Downloading the Docker image to localhost  is a one-liner

```shell
$ docker pull centos:8
8: Pulling from library/centos
8a29a15cefae: Pull complete
Digest: sha256:fe8d824220415eed5477b63addf40fb06c3b049404242b31982106ac204f6700
Status: Downloaded newer image for centos:8
docker.io/library/centos:8
```

Spinning up the container from the downloaded image and mounting the directory containing
my AWS config and credentials

```shell
docker run --name centos_8 -it -v /home/stefan/.aws:/root/.aws --rm centos:8
```

### Install required software

```shell
yum -y install python3-pip vim
pip3 install awscli
```

### Create repository configuration file

```shell
cd /etc/yum.repos.d/
touch s3.repo
```

The content of the file `s3.repo` is as below - only the `baseUrl` needs to be updated based
on the ARN of the S3 bucket.

```plaintext
[s3_repo-x86_64]
name = S3 repository
baseurl = https://correttoyumrepositorysta-correttos3bucketbbeb0a25-1gmfxywyksoie.s3.eu-central-1.amazonaws.com/
gpgcheck = 0
enabled = 1
```

Installing the Corretto JDK is then possible by running yum

```shell
$ yum install java-11-amazon-corretto-devel.x86_64
S3 repository                                                                                                     16 kB/s | 2.9 kB     00:00
[...]
  Vorbereitung läuft    :                                                                                                                    1/1
  Installieren          : java-11-amazon-corretto-devel-1:11.0.3.7-1.x86_64                                                                  1/1
  Ausgeführtes Scriptlet: java-11-amazon-corretto-devel-1:11.0.3.7-1.x86_64                                                                  1/1
  Überprüfung läuft     : java-11-amazon-corretto-devel-1:11.0.3.7-1.x86_64                                                                  1/1

Installiert:
  java-11-amazon-corretto-devel-1:11.0.3.7-1.x86_64

Fertig.
```

## ToDo

S3 treats "+" characters in the path as though they were space characters.
Hence renaming of the rpms files is required before

* running `createrepo`
* syncing the local content to S3

## Links

* [AdoptOpenJDK](https://adoptopenjdk.net/)
* [AdoptOpenJDK Downloads for CentOS 8](https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/8/x86_64/Packages/)
* [AWS Cloud Development Kit](https://github.com/aws/aws-cdk)
* [CentOS ISO Download Page](https://wiki.centos.org/Download)
* [Amazon Corretto 11 Guide for Linux](https://docs.aws.amazon.com/corretto/latest/corretto-11-ug/linux-info.html)
* [createrepo man page](https://linux.die.net/man/8/createrepo)
* [S3 as Yum repo](https://gist.github.com/phrawzty/ca3453addc92a13a9c19)
* [Using Amazon S3 as a Hosted Yum Repository](https://www.rightbrainnetworks.com/2015/01/09/using-amazon-s3-as-a-hosted-yum-repository/)
* [Yet Another Yum S3 Plugin](https://github.com/henrysher/cob)
* [S3 Escaping](https://stackoverflow.com/questions/38282932/amazon-s3-url-being-encoded-to-2)

[mergify]: https://mergify.io
[mergify-status]: https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/stefanfreitag/s3_yum_repository&style=for-the-badge
