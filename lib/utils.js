'use strict';

exports.unSubscribe = consumers => {
  consumers.forEach(consumer => {
    consumer.options.pullTimeDelayMillsWhenFlowControl = 60000;
    consumer.options.pullThresholdForQueue = 0;
  });
};

exports.getProcessCount = consumers => {
  let count = 0;
  consumers.forEach(consumer => {
    for (const key of consumer._processQueueTable.keys()) {
      if (consumer._processQueueTable.get(key)) {
        count += consumer._processQueueTable.get(key).processQueue.msgCount;
      }
    }
  });
  return count;
};
