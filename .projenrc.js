const { awscdk } = require('projen');
const { Stability } = require('projen/lib/cdk');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Stefan Freitag',
  authorAddress: 'stefan.freitag@udo.edu',
  cdkVersion: '2.156.0',
  stability: Stability.EXPERIMENTAL,
  defaultReleaseBranch: 'master',
  name: 's3_yum_repository_projen',
  repositoryUrl: 'git://github.com/stefanfreitag/s3_yum_repository.git',
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  keywords: [
    'aws',
    'cdk',
    's3',
  ],
  jsiiVersion: '5.x',
  jest: {
    jestVersion: '^29',
  },
  typescriptVersion: '5.3.3',
});
project.gitignore.addPatterns('.history/');
project.npmignore.addPatterns('.history/');

project.synth();