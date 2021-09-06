# egg-queue

## 使用插件

```js
// config/plugin.js
exports.queue = {
  enable: true,
  package: '@eebyjo/egg-queue',
};
```

## 使用說明

將單個或數個 bull instance 加載到 Egg.Application 上，
並統一事件、事件處理的設定及寫法。

### 固定事件 logger 輸出規格

1. completed
2. failed
3. stalled
4. paused
5. resumed

### 提供基本 queue 功能包裝

1. 關閉連線
2. 暫停 queue
3. 恢復 queue
4. 新增 job
5. 移除 job
6. 重試所有失敗 job

### 統一撰寫 process 的方式

單一實例：
```
// app/queue/task.js
module.exports = (ctx, queue) => {
  const handler = job => {
    // do something
  };

  queue.process(jobName, handler);

  return queue;
};
```

多實例：
```
// app/queue/accounting/task.js
module.exports = (ctx, queue) => {
  const handler = job => {
    // do something
  };

  queue.process(jobName, handler);

  return queue;
};

// app/queue/member/task.js
module.exports = (ctx, queue) => {
  const handler = job => {
    // do something
  };

  queue.process(jobName, handler);

  return queue;
};
```

## 設定

請到 [config/config.default.js](config/config.default.js) 查看設定說明。
