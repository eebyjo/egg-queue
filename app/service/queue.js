'use strict';

const Service = require('egg').Service;
const compact = require('lodash').compact;

class QueueService extends Service {
  /**
   * 關閉連線
   * @param  {string} name queue name
   */
  async close(name) {
    if (this.app[name]) await this.app[name].close();
  }

  /**
   * 暫停 queue
   * @param  {string} name queue name
   */
  async pause(name) {
    if (this.app[name]) await this.app[name].pause();
  }

  /**
   * 恢復 queue
   * @param  {string} name queue name
   */
  async resume(name) {
    if (this.app[name]) await this.app[name].resume();
  }

  /**
   * 新增 job
   * @param  {string} name queue name
   * @param  {string} option job option
   * @param  {string} option.jobName job name
   * @param  {object} option.data job data
   * @param  {object} option.options job options
   */
  async add(name, { jobName, data, options }) {
    if (this.app[name]) await this.app[name].add(...compact([ jobName, data, options ]));
  }

  /**
   * 移除 job
   * @param  {string} name queue name
   * @param  {string} id job id
   */
  async remove(name, id) {
    if (this.app[name]) {
      const job = await this.app[name].getJob(id);
      await job.remove();
    }
  }
}

module.exports = QueueService;
