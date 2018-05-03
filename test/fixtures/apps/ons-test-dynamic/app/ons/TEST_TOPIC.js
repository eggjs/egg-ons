'use strict';

class TestSubscriber {
  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
  }

  * subscribe(msg) {
    this.app.onsMsgs.set(msg.msgId, msg);
  }
}

module.exports = TestSubscriber;
