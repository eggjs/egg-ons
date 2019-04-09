'use strict';

const assert = require('assert');
const ONS = require('./lib/ons');
const { unSubscribe, getProcessCount } = require('./lib/utils');
const { sleep, doWhile } = require('pure-func/promise');

class AppBootHook {
  constructor(app) {
    app.ons = new ONS(app);
    this.app = app;
  }
  async didLoad() {
    await this.app.ons.init();
  }
  async willReady() {
    const { app } = this;
    for (const sub of app.config.ons.sub) {
      for (const topic of sub.topics) {
        const consumer = app.ons.consumerMap.get(
          Array.from(app.ons.consumerMap.keys()).find(key => key.includes(sub.consumerGroup))
        );
        await consumer.ready();
        if (!topic.indexOf('%')) {
          return;
        }
        const subscribeKey = topic.split('%')[1];
        const Subscriber = app.ONSSubscribers[subscribeKey];
        assert.ok(Subscriber);
        app.logger.info('subscribe ', topic, Subscriber.subExpression || '*');
        consumer.subscribe(topic, Subscriber.subExpression || '*', async msg => {
          const subscriber = new Subscriber(app);
          subscriber.ctx = app.createAnonymousContext({
            url: '/ons/' + topic + '/' + msg.tags + '/' + (msg.body.length < 50 ? msg.body.toString() : ''),
          });
          await subscriber.subscribe(msg);
        });
      }
    }
  }
  async beforeClose() {
    const { app } = this;
    const consumers = Array.from(app.ons.consumerMap.values());
    unSubscribe(consumers);
    await sleep(1000);
    const processCount = getProcessCount(consumers);
    await doWhile(async () => {
      await sleep(processCount * 100);
      return getProcessCount(consumers);
    }, processCount => processCount > 0);
    await Promise.all(consumers.map(consumer => {
      return consumer.close();
    }));
    const producers = Array.from(
      app.ons.producerMap.values()
    );
    await Promise.all(producers.map(producer => {
      return producer.close();
    }));
  }
}

module.exports = AppBootHook;
