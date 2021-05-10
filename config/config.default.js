'use strict';

/**
 * egg-queue default config
 * @member Config#queue
 */
exports.queue = {
  default: {
    baseDir: 'queue',
    defaultJobOptions: {
      attempts: 3,
      backoff: 10000,
      removeOnComplete: true,
      timeout: 90000,
    },
    redis: {
      host: '127.0.0.1',
      port: '6379',
    },
  },

  // Single Queue
  // client: {
  //   name: 'name',
  //   baseDir: 'baseDir',
  //   redis: {
  //     host: 'host',
  //     port: 'port',
  //   },
  // },

  // Multi Queues
  // clients: [
  //   {
  //     name: 'name',
  //     baseDir: 'baseDir',
  //     redis: {
  //       host: 'host',
  //       port: 'port',
  //     },
  //   },
  //   {
  //     name: 'name',
  //     baseDir: 'baseDir',
  //     redis: {
  //       host: 'host',
  //       port: 'port',
  //     },
  //   },
  // ],
};
