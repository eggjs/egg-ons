'use strict';

const Message = require('ali-ons').Message;
const Consumer = require('ali-ons').Consumer;
const Producer = require('ali-ons').Producer;
const path = require('path');
const assert = require('assert');

module.exports = class ONS {
  constructor(app) {
    this.app = app;
    this.logger = app.getLogger('onsLogger');
    this.config = app.config.ons;
    app.ready(() => {
      this.appReady = true;
    });

    this.consumerMap = new Map();
    this.producerMap = new Map();
    this.topic2Producer = new Map();
    this.Message = Message;
  }

  async init() {
    const { app } = this;
    const { sub, pub } = this.config;
    const directory = path.join(app.config.baseDir, 'app/ons');
    app.loader.loadToApp(directory, 'ONSSubscribers', {
      caseStyle(filepath) {
        return filepath.substring(0, filepath.lastIndexOf('.')).split('/');
      },
    });
    for (const options of sub) {
      await this.createConsumer(options, app.ONSSubscribers);
    }

    for (const options of pub) {
      await this.createProducer(options);
    }
  }

  _errorHandler(err) {
    // avoid output error message into stderr before app get ready
    this.appReady ? this.logger.error(err) : this.logger.warn(err);
  }

  async createConsumer(options, Subscribers) {
    const { app, consumerMap, logger, config } = this;
    const consumer = new Consumer(Object.assign({
      httpclient: app.httpclient,
      logger,
    }, config.default, options));
    consumer.on('error', err => this._errorHandler(err));
    const key = `${consumer.consumerGroup}-${consumer.clientId}`;
    assert(!consumerMap.has(key), `[egg-ons] duplicate consumer, consumerGroup=${consumer.consumerGroup}, clientId=${consumer.clientId}`);
    consumerMap.set(key, consumer);

    await consumer.ready();
    logger.info('[egg-ons] consumer: %s is ready, messageModel: %s', consumer.consumerGroup, consumer.messageModel);

    if (consumer.options.autoClose) {
      app.beforeClose(async function() {
        await consumer.close();
        logger.info('[egg-ons] consumer: %s is closed, messageModel: %s', consumer.consumerGroup, consumer.messageModel);
      });
    }

    const topics = options.topics || [];
    for (const topic of topics) {
      const Subscriber = Subscribers[topic];
      if (!Subscriber) {
        app.coreLogger.warn('[egg-ons] CANNOT find the subscription logic for topic=%s', topic);
        continue;
      }

      consumer.subscribe(topic, Subscriber.subExpression || '*', async function(msg) {
        const ctx = app.createAnonymousContext();
        const subscriber = new Subscriber(ctx);
        await subscriber.subscribe(msg);
      });
    }
  }

  async createProducer(options) {
    const { app, producerMap, logger, config, topic2Producer } = this;
    const producer = new Producer(Object.assign({
      httpclient: app.httpclient,
      logger,
    }, config.default, options));
    producer.on('error', err => this._errorHandler(err));
    assert(!producerMap.has(producer.producerGroup), `[egg-ons] duplicate producer, producerGroup=${producer.producerGroup}`);
    producerMap.set(producer.producerGroup, producer);

    const topics = options.topics || [];
    for (const topic of topics) {
      topic2Producer.set(topic, producer);
    }

    await producer.ready();
    logger.info('[egg-ons] producer: %s is ready', producer.producerGroup);

    if (producer.options.autoClose) {
      app.beforeClose(async function() {
        await producer.close();
        logger.info('[egg-ons] producer: %s is closed', producer.producerGroup);
      });
    }
  }

  async send(msg) {
    assert(msg && msg.topic, '[egg-ons] send(msg) msg.topic is required');
    const producer = this.topic2Producer.get(msg.topic);
    assert(producer, `[egg-ons] CANNOT find producer for topic=${msg.topic}`);
    return await producer.send(msg);
  }
};
