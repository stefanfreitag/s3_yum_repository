import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import CorrettoYumRepository = require('../lib/corretto_yum_repository-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CorrettoYumRepository.CorrettoYumRepositoryStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
