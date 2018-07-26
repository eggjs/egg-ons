'use strict';

const ONS = require('./lib/ons');

module.exports = app => {
  app.ons = new ONS(app);
  app.beforeStart(async () => {
    await app.ons.init();
  });
};
