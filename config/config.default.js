'use strict';

const path = require('path');

module.exports = appInfo => {
  return {
    /**
     * egg-ons default config
     * @member Config#ons
     */
    ons: {
      default: {
        autoClose: true,
        // 公有云生产环境：http://onsaddr-internal.aliyun.com:8080/rocketmq/nsaddr4client-internal
        // 公有云公测环境：http://onsaddr-internet.aliyun.com/rocketmq/nsaddr4client-internet
        // 杭州金融云环境：http://jbponsaddr-internal.aliyun.com:8080/rocketmq/nsaddr4client-internal
        // 杭州深圳云环境：http://mq4finance-sz.addr.aliyun.com:8080/rocketmq/nsaddr4client-internal
        onsAddr: 'http://onsaddr-internet.aliyun.com/rocketmq/nsaddr4client-internet',
        // accessKey: 'your-accesskey',
        // secretKey: 'your-secretkey',
      },
      sub: [
        // {
        //   consumerGroup: 'your-group',
        //   accessKey: 'your-accesskey',
        //   secretKey: 'your-secretkey',
        //   topics: [
        //     'your-topic-1',
        //     'your-topic-2',
        //   ],
        // }
      ],
      pub: [
        // {
        //   producerGroup: 'your-group',
        //   accessKey: 'your-accesskey',
        //   secretKey: 'your-secretkey',
        //   topics: [
        //     'your-topic-1',
        //     'your-topic-2',
        //   ],
        // }
      ],
    },
    customLogger: {
      onsLogger: {
        consoleLevel: 'NONE',
        file: path.join(appInfo.root, 'logs', appInfo.name, 'ons.log'),
      },
    },
  };
};
