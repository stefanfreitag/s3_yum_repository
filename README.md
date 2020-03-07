# YUM repository hosted in S3

The idea of using an S3 bucket as YUM repository is not new at all.
There are several blog posts available on the Internet. 
I attached a few links to this document.

In the background I will use the Cloud Development Kit (CDK)

## Set up a local repository and sync to S3

* Install `createrepo` on your local maching
```
$ apt install createrepo    
```

* Create a new directory that will contain the repository relevant information
```
$ mkdir s3_yum_repository     
$ createrepo ./s3_yum_repository 
Saving Primary metadata
Saving file lists metadata
Saving other metadata
Generating sqlite DBs
Sqlite DBs complete
``` 
A `repodata` directory has been created with some content in
```
$ ls -la s3_yum_repository/repodata 
insgesamt 36
drwxrwxr-x 2 stefan stefan 4096 Mär  7 10:02 .
drwxrwxr-x 3 stefan stefan 4096 Mär  7 10:02 ..
-rw-rw-r-- 1 stefan stefan  596 Mär  7 10:02 3a328022a8e00eef63b49016503a1a49b3876cff5291122727665572777f9602-filelists.sqlite.bz2
-rw-rw-r-- 1 stefan stefan  123 Mär  7 10:02 401dc19bda88c82c403423fb835844d64345f7e95f5b9835888189c03834cc93-filelists.xml.gz
-rw-rw-r-- 1 stefan stefan  576 Mär  7 10:02 64389132bada61abb26a19f38ce25e2803c98b9991c7074c5106146685ab6328-other.sqlite.bz2
-rw-rw-r-- 1 stefan stefan  123 Mär  7 10:02 6bf9672d0862e8ef8b8ff05a2fd0208a922b1f5978e6589d87944c88259cb670-other.xml.gz
-rw-rw-r-- 1 stefan stefan 1107 Mär  7 10:02 cf738951359cd92c37dcff7486226da31ed0ff4ebda9678fa229e4d74836c448-primary.sqlite.bz2
-rw-rw-r-- 1 stefan stefan  134 Mär  7 10:02 dabe2ce5481d23de1f4f52bdcfee0f9af98316c9e0de2ce8123adeefa0dd08b9-primary.xml.gz
-rw-rw-r-- 1 stefan stefan 2964 Mär  7 10:02 repomd.xml
```

* Prepare the directory structure
We will only make use of the `x86_64` folder.
```
mkdir -p s3_yum_repository/{noarch,x86_64,SRPMS}
```

* Download the RPM files
```
$ wget https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/8/x86_64/Packages/adoptopenjdk-13-hotspot-13+33-1.x86_64.rpm    
$ wget https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/8/x86_64/Packages/adoptopenjdk-13-hotspot-jre-13+33-1.x86_64.rpm
$ wget https://d3pxv6yz143wms.cloudfront.net/11.0.3.7.1/java-11-amazon-corretto-devel-11.0.3.7-1.x86_64.rpm
```

```
cp ./adoptopenjdk-13-hotspot-13+33-1.x86_64.rpm  s3_yum_repository/x86_64 
cp./ java-11-amazon-corretto-devel-11.0.3.7-1.x86_64.rpm s3_yum_repository/x86_64 
```

* Re-create the repository data
```
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


* Synchronize the content of your local YUM repository to the S3 bucket
```
$  aws s3 sync --profile cdk s3_yum_repository s3://correttoyumrepositorysta-correttos3bucketbbeb0a25-1p908wuzpckvj  
```




## Testing

## Setup CentOS 8 VM
* Use the ISO image `CentOS-8.1.1911-x86_64-boot.iso` as starting point
* Choose _minimal setup_ to define the set of packages to install


## Create repository file

cd /etc/yum.repos.d/
touch s3.repo

```
[s3_repo-x86_64]
name = S3 repository
baseurl = https://correttoyumrepositorysta-correttos3bucketbbeb0a25-1gmfxywyksoie.s3.eu-central-1.amazonaws.com/x86_64/
gpgcheck = 0
enabled = 1

[s3_repo-x86_64]
name = S3 repository
baseurl = https://correttoyumrepositorysta-correttos3bucketbbeb0a25-1gmfxywyksoie.s3.eu-central-1.amazonaws.com/x86_64/
gpgcheck = 0
enabled = 1
```


```
[root@localhost yum.repos.d]# yum install java-11-amazon-corretto-devel.x86_64
S3 repository                                                                                                     16 kB/s | 2.9 kB     00:00    
Abhängigkeiten sind aufgelöst.
=================================================================================================================================================
 Package                                           Architecture               Version                          Repository                   Size
=================================================================================================================================================
Installieren:
 java-11-amazon-corretto-devel                     x86_64                     1:11.0.3.7-1                     s3_repo                     182 M

Transaktionsübersicht
=================================================================================================================================================
Installieren  1 Paket

Gesamtgröße: 182 M
Installationsgröße: 304 M
Ist dies in Ordnung? [j/N]: j
Pakete werden heruntergeladen:
[SKIPPED] java-11-amazon-corretto-devel-11.0.3.7-1.x86_64.rpm: Already downloaded                                                               
-------------------------------------------------------------------------------------------------------------------------------------------------
Gesamt                                                                                                            18 GB/s | 182 MB     00:00     
Transaktionsüberprüfung wird ausgeführt
Transaktionsprüfung war erfolgreich.
Transaktion wird getestet
Transaktionstest war erfolgreich.
Transaktion wird ausgeführt
  Vorbereitung läuft    :                                                                                                                    1/1 
  Installieren          : java-11-amazon-corretto-devel-1:11.0.3.7-1.x86_64                                                                  1/1 
  Ausgeführtes Scriptlet: java-11-amazon-corretto-devel-1:11.0.3.7-1.x86_64                                                                  1/1 
  Überprüfung läuft     : java-11-amazon-corretto-devel-1:11.0.3.7-1.x86_64                                                                  1/1 

Installiert:
  java-11-amazon-corretto-devel-1:11.0.3.7-1.x86_64                                                                                              

Fertig.
```

## Links

* [AdoptOpenJDK](https://adoptopenjdk.net/)
* [AdoptOpenJDK Downloads for CentOS 8](https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/8/x86_64/Packages/)
* [AWS Cloud Development Kit](https://github.com/aws/aws-cdk)
* [CentOS ISO Download Page](https://wiki.centos.org/Download)
* [Amazon Corretto 11 Guide for Linux
](https://docs.aws.amazon.com/corretto/latest/corretto-11-ug/linux-info.html)
* [S3 as Yum repo
](https://gist.github.com/phrawzty/ca3453addc92a13a9c19)
*[Using Amazon S3 as a Hosted Yum Repository
](https://www.rightbrainnetworks.com/2015/01/09/using-amazon-s3-as-a-hosted-yum-repository/)