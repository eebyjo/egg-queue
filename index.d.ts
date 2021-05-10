import * as bull from 'bull';

interface IRedis {
  host?: string;
  port?: string;
}

interface IBullConfig extends bull.QueueOptions {
  /**
   * queue name
   */
  name: string;

  /**
   * load handlers from `app/queue/*.js`
   */
  baseDir: string;

  /**
   * redis setting
   */
  redis?: IRedis;
}

interface Ddefault {
  /**
   * load handlers from `app/queue/*.js`
   */
  baseDir?: string;

  /**
   * default job options
   */
  defaultJobOptions?: bull.JobOptions;

  /**
   * default redis setting
   */
  redis?: IRedis;
}

declare module 'egg' {
  // extend app
  interface Application {
    Bull: typeof bull;
  }

  interface EggAppConfig {
    queue: {
      client?: IBullConfig;
      clients?: IBullConfig[];
      default?: IBullConfig;
    };
  }
}