'use strict';

const assert = require('assert');
const sleep = require('mz-modules/sleep');

module.exports = app => {
  app.get('/', function* () {
    this.body = 'hi, ' + app.plugins.ons.name;
  });

  app.get('/sendMessage', function* () {
    const Message = this.ons.Message;
    const msg = new Message('TEST_TOPIC', // topic
      'TagA', // tag
      'Hello ONS !!!' // body
    );
    const sendResult = yield this.ons.send(msg);
    assert.equal(sendResult.sendStatus, 'SEND_OK');

    yield sleep(1000);

    assert(app.onsMsgs.has(sendResult.msgId));
    this.body = 'ok';
  });
};
