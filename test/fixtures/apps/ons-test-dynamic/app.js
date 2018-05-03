'use strict';

module.exports = app => {
  app.onsMsgs = new Map();
  app.beforeStart(function* () {
    yield app.ons.createConsumer(app.config.ons.dynamicSub, {
      TEST_TOPIC: require('./app/ons/TEST_TOPIC'),
    });
    yield app.ons.createProducer(app.config.ons.dynamicPub);
  });
};
