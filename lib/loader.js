'use strict';

const assert = require('assert');
const Queue = require('bull');
const get = require('lodash').get;
const path = require('path');

module.exports = app => {
  const config = app.config.queue;

  const clients = [];
  if (config.client) {
    if (config.default) config.client = Object.assign({}, config.default, config.client);
    clients.push(config.client);
  } else if (config.clients) {
    config.clients.forEach(client => {
      if (config.default) client = Object.assign({}, config.default, client);
      client.baseDir = `${client.baseDir}/${client.name}`;
      clients.push(client);
    });
  }

  app.beforeStart(async () => {
    for (const client of clients) {
      const queue = loadQueue(client);
      await queue.isReady();
      app.coreLogger.info(`[@eebyjo/egg-queue] queue[${queue.name}] status OK`);
    }
  });

  /**
   * load queue to app[config.name]
   * @param {Object} config config for load
   *   - name: load model to app[name]
   *   - baseDir: where processHandler located
   *   - other queue configures(redis host, port, etc...)
   * @return {Object} queue instance
   */
  function loadQueue(config = {}) {
    assert(config.name && config.redis.host && config.redis.port, `[@eebyjo/egg-queue] 'name: ${config.name}', 'host: ${config.redis.host}', 'port: ${config.redis.port}' are required on config`);
    // 創建實例
    const queue = new Queue(config.name, { defaultJobOptions: config.defaultJobOptions, redis: config.redis });

    // 重複定義 name 時報錯
    if (app[config.name]) {
      throw new Error(`[@eebyjo/egg-queue] app[${config.name}] is already defined`);
    }

    Object.defineProperty(app, config.name, {
      value: queue,
      writable: false,
      configurable: true,
    });

    const DELEGATE = Symbol(`context#queue_${config.name}`);

    Object.defineProperty(app.context, config.name, {
      get() {
        if (!this[DELEGATE]) {
          this[DELEGATE] = Object.create(app[config.name]);
          this[DELEGATE].ctx = this;
        }
        return this[DELEGATE];
      },
      configurable: true,
    });

    const slack = get(app, 'slack', () => {}).bind(app);

    // 基本事件處理
    queue.on('completed', (job, result) => {
      app.logger.info(`[${queue.name}: ${job.name} Job: ${job.id}] has been completed${result ?? `\nresult: ${result}`}`);
      slack('info', `[${queue.name}: ${job.name} Job: ${job.id}] has been completed${result ?? `\nresult: ${result}`}`);
    });

    queue.on('failed', (job, err) => {
      if (job.attemptsMade === job.opts.attempts || job._discarded) {
        app.logger.error(`[${queue.name}: ${job.name} Job: ${job.id}] has been failed`, err);
        slack('warning', `[${queue.name}: ${job.name} Job: ${job.id}] has been failed\ndata: \`\`\`${JSON.stringify(job.data, undefined, 2)}\`\`\`\nfailed: \*${err.message}\*`);
      }
    });

    queue.on('stalled', job => {
      app.logger.error(`[${queue.name}: ${job.name} Job: ${job.id}] has been stalled`);
      slack('warning', `[${queue.name}: ${job.name} Job: ${job.id}] has been stalled`);
    });

    queue.on('paused', () => {
      app.logger.info(`[${queue.name}] queue paused`);
      slack('info', `[${queue.name}] queue paused`);
    });

    queue.on('resumed', () => {
      app.logger.info(`[${queue.name}] queue resumed`);
      slack('info', `[${queue.name}] queue resumed`);
    });

    const ctx = app.createAnonymousContext();
    const processDir = path.join(app.baseDir, 'app', config.baseDir);
    const target = Symbol(config.name);

    // 載入 process
    app.loader.loadToApp(processDir, target, {
      caseStyle: 'upper',
      initializer(factory) {
        if (typeof factory === 'function') {
          return factory(ctx, queue);
        }
      },
    });

    return app[config.name];
  }
};
