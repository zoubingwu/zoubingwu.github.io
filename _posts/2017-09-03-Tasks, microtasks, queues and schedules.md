---
layout: post
title: "Tasks, microtasks, queues and schedules"
date: 2017-09-03 21:02:33
tags:
- javascript
description: "讲讲浏览器端 event loop 中的 task 和 microtask..."
---

### 前言

理解事件循环是编写良好异步代码的基础，关于 event loop 有许多不错的文章，我之前看过的一个 Philip Roberts 在 JSConf 上的[视频](https://www.youtube.com/watch?v=8aGhZQkoFbQ)里对此也介绍的很浅显易懂，但其中并没有牵涉到 microtask 相关的部分，而这也是这篇文章想记录的内容。

我们首先来看看下面的代码：

```js
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');
```

对事件循环和异步稍微熟悉的同学很容易就能得出正确的答案：

```
script start
script end
promise1
promise2
setTimeout
```

### But why?

要搞清楚其中的原理，首先需要明白 event loop 是如何处理 tasks 和 microtasks 的。

我们都知道 js 是单线程运行，一个线程内都有各自的 event loop，web worker 也都有自己单独的 event loop，以使得他们可以独立运行(关于 web worker 的内容可以参见文末的MDN链接)，而在同一个域内的 window 将共享一个event loop。

event loop 不断循环，只要栈中的同步代码完成后就会去执行其队列中的任务。那么他们这些任务的执行顺序又是怎么样的呢？按照进入队列时间的先后的顺序来执行吗？

nah，实际上浏览器出于优化的目的，对他们的执行顺序也是有优先级的区别的。

> **Tasks** are scheduled so the browser can get from its internals into JavaScript/DOM land and ensures these actions happen sequentially. Between tasks, the browser may render updates. Getting from a mouse click to an event callback requires scheduling a task, as does parsing HTML, and in the above example, setTimeout.

在上面的例子里，从脚本开始运行`console.log('script start')`开始到结束语句 `console.log('script end')` 都是我们的第一个 task，而 setTimeout 会在一个给定的延迟后，并且要等到上一个 task 结束以后，再开始一个新的 task，所以很明显我们在 setTimeout 中传入的第二个参数时间并不意味着准确的时间，实际上应该是最小时间，因为哪怕时间到了，上一个 task 如果还没有结束，那么依然需要继续等待。

> **Microtasks** are usually scheduled for things that should happen straight after the currently executing script, such as reacting to a batch of actions, or to make something async without taking the penalty of a whole new task. The microtask queue is processed after callbacks as long as no other JavaScript is mid-execution, and at the end of each task. Any additional microtasks queued during microtasks are added to the end of the queue and also processed. Microtasks include mutation observer callbacks, and as in the above example, promise callbacks.

而 microtask 则可以理解为在同一个 task 的末尾，执行完了同步代码以后，再去立即执行的代码。可以想象成在同一个 task 内，microtask 被推入了队列内来执行。

典型的 MacroTask 包含了 setTimeout, setInterval, setImmediate, requestAnimationFrame, I/O, UI rendering 等，MicroTask 包含了 process.nextTick, Promises, Object.observe, MutationObserver 等。 二者的关系可以图示如下：

![]({{site.url}}/assets/images/2017-09-03/1.jpg)

一个事件循环(Event Loop)会有一个或多个任务队列(Task Queue，又称 Task Source)，这里的 Task Queue 就是 MacroTask Queue，而 Event Loop 仅有一个 MicroTask Queue。每个 Task Queue 都保证自己按照回调入队的顺序依次执行，所以浏览器可以从内部到JS/DOM，保证动作按序发生。而在 Task 的执行之间则会清空已有的 MicroTask 队列，在 MacroTask 或者 MicroTask 中产生的 MicroTask 同样会被压入到 MicroTask 队列中并执行

我们按顺序一步一步详细解释这个例子：

1. 首先开始了第一个 task A;
2. 打印 'script start';
3. 创建了第二个 task B 放入队列里，内容是打印 'setTimeout';
4. 继续我们未完成的 task A，创建一个 promise并且马上 resolve;
5. 把resolve后的任务打印 'promise1' 作为 microtask 放入队列，既然是 microtask，那么他必须仍然是 task A 中的任务，因此在队列中会在 task B 之前;
6. 同样的，下一个 then 又继续将打印 'promise2' 作为 microtask 来push进队列，在队列中紧跟在 5 之后，而在 3 之后;
7. 打印'script end';
8. task A 结束了吗？木有，此时我们来运行 队列中属于 task A 中的microtasks;
9. 打印 'promise1';
10. 打印 'promise2';
11. 终于 task A 结束了;
12. 开始 task B，打印 'setTimeout';
13. 全部 task 结束;

### 浏览器的区别

有某些浏览器，它们会将 promise 的异步作为新的task，而不是 microtask，此时就会出现先打印 setTimeout，然后才打印 promise1 和 promise1。

> Treating promises as tasks leads to performance problems, as callbacks may be unnecessarily delayed by task-related things such as rendering. It also causes non-determinism due to interaction with other task sources, and can break interactions with other APIs, but more on that later.

### 如何分辨到底是 task 还是 microtask呢

其实和处理大部分问题一样，就两个方法：

- 测试

- 查看标准，比如 [step 5 of queue-a-mutation-record](https://dom.spec.whatwg.org/#queue-a-mutation-record)，再比如[setTimeout 16.Queue the task task.](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timer-initialisation-steps)，再再比如[promise step 8.b Perform EnqueueJob](http://www.ecma-international.org/ecma-262/6.0/#sec-performpromisethen)，注意 ECMAScript 里把 microtask 叫做 jobs。

### ref

- [https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)

- [https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
