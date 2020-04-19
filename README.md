<!-- markdownlint-disable MD012 MD014 -->
# YUM repository hosted in S3

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/35fc9af4fb4a492f8f4686469999b527)](https://app.codacy.com/manual/stefan_20/s3_yum_repository?utm_source=github.com&utm_medium=referral&utm_content=stefanfreitag/s3_yum_repository&utm_campaign=Badge_Grade_Settings)

[![Mergify Status][mergify-status]][mergify]

[mergify]: https://mergify.io
[mergify-status]: https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/stefanfreitag/s3_yum_repository&style=for-the-badge

## Disclaimer

>The idea of using an S3 bucket as YUM repository is not new. Several blog posts are available on the Internet.

We will use the Cloud Development Kit (CDK)  to setup the S3 bucket



## The local repository

Install `createrepo` on the machine

```bash
$ apt install createrepo
```

Create directory that will hold the repository content

```bash
$ mkdir s3_yum_repository
$ createrepo ./s3_yum_repository
Saving Primary metadata
Saving file lists metadata
Saving other metadata
Generating sqlite DBs
Sqlite DBs complete
```


A `repodata` directory will be created with some content in

```bash
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

```bash
mkdir -p s3_yum_repository/{noarch,x86_64,SRPMS}
```

Only the `x86_64` folder will be used for storing our RPMs


Download the RPM files

* Adopt JDK & JRE
* Corretto 11 JDK

```bash
$ wget https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/8/x86_64/Packages/
    adoptopenjdk-13-hotspot-13+33-1.x86_64.rpm

$ wget https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/8/x86_64/Packages/
    adoptopenjdk-13-hotspot-jre-13+33-1.x86_64.rpm

$ wget https://d3pxv6yz143wms.cloudfront.net/11.0.3.7.1/
    java-11-amazon-corretto-devel-11.0.3.7-1.x86_64.rpm
```


Move the files to the repository directory

```bash
cp ./adoptopenjdk-13-hotspot-13+33-1.x86_64.rpm  s3_yum_repository/x86_64

cp ./adoptopenjdk-13-hotspot-jre-13+33-1.x86_64.rpm  s3_yum_repository/x86_64

cp ./java-11-amazon-corretto-devel-11.0.3.7-1.x86_64.rpm s3_yum_repository/x86_64
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



## The S3 Bucket

### Create the bucket
  
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

* Allow access to the objects in the bucket
* Restrict access to specific source IP

```javascript
const bucketContentStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject"],
      resources: [bucket.bucketArn + "/*"],
      principals: [new AnyPrincipal()]
    });

    bucketContentStatement.addCondition("IpAddress", {
      "aws:SourceIp": "123.456.789.012/32"
    });
```


Allow the list operation on the bucket itself

```javascript
    const bucketStatement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket"],
      resources: [bucket.bucketArn],
      principals: [new AnyPrincipal()]
    });

    bucketStatement.addCondition("IpAddress", {
      "aws:SourceIp": "123.456.789.012/32"
    });
```


### Define the bucket policy

```javascript
const bucketPolicy = new BucketPolicy(this, "bucketPolicy", {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      bucketContentStatement,
      bucketStatement
    );
```



## Sync to AWS S3 Bucket

Synchronize the content of your local YUM repository to the S3 bucket

```bash
$ aws s3 sync --profile cdk s3_yum_repository \
     s3://correttoyumrepositorysta-correttos3bucketbbeb0a25-1p908wuzpckvj  
```



## Testing


## Setup CentOS 8 VM

* Use the ISO image `CentOS-8.1.1911-x86_64-boot.iso` as starting point
* Choose _minimal setup_ to define the set of packages to install


## Create repository file

```bash
$ cd /etc/yum.repos.d/
$ touch s3.repo
```

Content of the repository file

```
[s3_repo-x86_64]
name = S3 repository
baseurl = https://correttoyumrepositorysta-correttos3bucketbbeb0a25-1gmfxywyksoie.s3.eu-central-1.amazonaws.com/
gpgcheck = 0
enabled = 1
```


Install the JDK

```bash
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


## Bewarre

* S3 treats "+" characters in the path as though they were space characters
* Renaming of rpms maybe required before
  * running `createrepo`
  * syncing to S3



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