# egg-ons

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-ons.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-ons
[travis-image]: https://img.shields.io/travis/eggjs/egg-ons.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-ons
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-ons.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-ons?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-ons.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-ons
[snyk-image]: https://snyk.io/test/npm/egg-ons/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-ons
[download-image]: https://img.shields.io/npm/dm/egg-ons.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-ons

aliyun ons plugin for egg

## Install

```bash
$ npm i egg-ons --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.ons = {
  enable: true,
  package: 'egg-ons',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.ons = {
  default: {
    accessKey: 'your-accessKey',
    secretKey: 'your-secretKey',
    // prod：http://onsaddr-internal.aliyun.com:8080/rocketmq/nsaddr4client-internal
    // dev： http://onsaddr-internet.aliyun.com/rocketmq/nsaddr4client-internet
    // onsAddr: 'http://onsaddr-internet.aliyun.com/rocketmq/nsaddr4client-internet',
  },
  sub: [{
    consumerGroup: 'your-consumer-group',
    topics: [
      'your-topic',
    ],
  }],
  pub: [{
    producerGroup: 'your-producer-group',
    topics: [
      'your-topic',
    ],
  }],
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

### Consumer

put your subscription codes under the folder `{app_root}/app/ons` and named as the topic name e.g `TP_NAME.js`

```
.
├── app
│   ├── ons
│   │   └── TP_NAME.js
│   ├── public
│   └── router.js
├── config
│   └── config.default.js
├── package.json
```

you should implment a subscriber as blow

```js
// TP_NAME.js
'use strict';

class TestSubscriber {
  constructor(ctx) {
    this.ctx = ctx;
  }

  * subscribe(msg) {
    yield this.ctx.service.messageService.process(msg);
  }

  static get subExpression() {
    return 'TagA';
  }
}

module.exports = TestSubscriber;
```

see [RPC](https://github.com/eggjs/egg/issues/1468) for more detail.

### Producer

using `app.ons / ctx.ons` to create & send messages

```js
const Message = ctx.ons.Message;
const msg = new Message('TP_NAME', // topic
  'TagA', // tag
  'Hello ONS !!!' // body
);
const sendResult = yield ctx.ons.send(msg);
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).


## Secure Keys

ping @fengmk2 to give you the access key!

- [ons secure keys](https://sharelock.io/1/AbXLnDfKcK5syo0rNnmIfYFagr-YZ9FdYjsV84rrQ0E.Q7hdg2/gPqxUCvlzQ2Kc6TEodWs3pOngxYpzKOAw-oCAgQZ4ZFZ8UF5HD/78NoP0krmaT7I4Ny_h7t4xhiAY2aLzwYlRwlHEmeEPeD7_6ZOI/J_QxBEFyEtAej_CMTL-5gJJS-dOA3lkyy8n3b7--0rJrSt2Vru/KY4Sdu6rwnsU9VZwAr-G2R_P8XiR4pHoHXuppYYbbcuu1PCQNK/rM8ajQMGMZg_PUqQWxaI6_zq0rr8gnmydeebKY0FBkkRRcDbat/v5eDQH6VrBSAqfMcoMEGWBMBeyFId3ClpO5LI0Bh1QFlvD9VbY/1LYQf3B475RvP5mpOgvdvx4xaCMdzSEXjbfZ6eQbDyT7QdF75S/hqr7u5Mclln66T718GxKCZ7XselJFPzxWyLv9Wos8gFIuNBl59/XhsrYXMf7In_W_qZQ84EvuB38CD5GubHsboVkuL0p3eOM4Vj3u/qGUQNUXa5CbGwHg1tKzP3E5eJLCiNX5DCTH2np-YDQJ5BOic27/Gy95jKwNTqowGT-n8vOpzn3b2ZIPDBZW2xaSI5NCYrbAMc9lbm/R-Vg751_pFx51fI1C4VoMBC44qgb5auUwtnEbl-DvKDuI2qb6b/-grhrQBp5wMZPBZMi5YfiOGQJxSMhxfGLjTwOJhCnojlcjls1Z/DMEaYzol0xDRdJYG5VwlaKUyIU_iAMfhFU7XZI_T3cqXdI3Pxg/XaCm0n2iJIJMjh0FE.G5xap1BPeUo3wZzXanJa8A#)

## License

[MIT](LICENSE)
