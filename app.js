'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Message = require('ali-ons').Message;
const Consumer = require('ali-ons').Consumer;
const Producer = require('ali-ons').Producer;

module.exports = app => {
  const logger = app.getLogger('onsLogger');
  const { sub, pub } = app.config.ons;
  const defaultOptions = app.config.ons.default;
  const httpclient = app.httpclient;
  const consumerMap = new Map();
  const producerMap = new Map();
  const topic2Producer = new Map();
  let appReady = false;

  app.ready(() => {
    appReady = true;
  });

  function errorHandler(err) {
    // 应用启动前避免错误输出到标准输出
    if (appReady) {
      logger.error(err);
    } else {
      logger.warn(err);
    }
  }

  for (const options of sub) {
    const consumer = new Consumer(Object.assign({
      httpclient,
      logger,
    }, defaultOptions, options));
    consumer.on('error', errorHandler);
    const key = `${consumer.consumerGroup}-${consumer.clientId}`;
    assert(!consumerMap.has(key), `[egg-ons] duplicate consumer, consumerGroup=${consumer.consumerGroup}, clientId=${consumer.clientId}`);
    consumerMap.set(key, consumer);

    app.beforeStart(function* () {
      yield consumer.ready();
      logger.info('[egg-ons] consumer: %s is ready, messageModel: %s', consumer.consumerGroup, consumer.messageModel);
    });
    app.beforeClose(function* () {
      yield consumer.close();
      logger.info('[egg-ons] consumer: %s is closed, messageModel: %s', consumer.consumerGroup, consumer.messageModel);
    });

    const topics = options.topics || [];
    for (const topic of topics) {
      const filepath = path.join(app.config.baseDir, 'app/ons', topic + '.js');
      if (!fs.existsSync(filepath)) {
        app.coreLogger.warn('[egg-ons] CANNOT find the subscription logic in file:`%s` for topic=%s', filepath, topic);
        continue;
      }
      const Subscriber = require(filepath);
      consumer.subscribe(topic, Subscriber.subExpression || '*', function* (msg) {
        const ctx = app.createAnonymousContext();
        const subscriber = new Subscriber(ctx);
        yield subscriber.subscribe(msg);
      });
    }
  }

  for (const options of pub) {
    const producer = new Producer(Object.assign({
      httpclient: app.httpclient,
      logger,
    }, defaultOptions, options));
    producer.on('error', errorHandler);
    assert(!producerMap.has(producer.producerGroup), `[egg-ons] duplicate producer, producerGroup=${producer.producerGroup}`);
    producerMap.set(producer.producerGroup, producer);

    const topics = options.topics || [];
    for (const topic of topics) {
      topic2Producer.set(topic, producer);
    }

    app.beforeStart(function* () {
      yield producer.ready();
      logger.info('[egg-ons] producer: %s is ready', producer.producerGroup);
    });
    app.beforeClose(function* () {
      yield producer.close();
      logger.info('[egg-ons] producer: %s is closed', producer.producerGroup);
    });
  }

  app.ons = {
    consumerMap,
    producerMap,
    Message,
    * send(msg) {
      assert(msg && msg.topic, '[egg-ons] send(msg) msg.topic is required');
      const producer = topic2Producer.get(msg.topic);
      assert(producer, `[egg-ons] CANNOT find producer for topic=${msg.topic}`);
      return yield producer.send(msg);
    },
  };
};
