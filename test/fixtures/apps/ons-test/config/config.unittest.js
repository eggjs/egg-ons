'use strict';

const config = require('../../../../config');

exports.keys = '123456';

exports.ons = {
  default: {
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    onsAddr: config.onsAddr,
  },
  sub: [{
    consumerGroup: config.consumerGroup,
    topics: [
      'TEST_TOPIC',
    ],
  }],
  pub: [{
    producerGroup: config.producerGroup,
    topics: [
      'TEST_TOPIC',
    ],
  }],
};
