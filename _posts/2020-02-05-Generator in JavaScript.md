---
layout: post
title: "Generator in JavaScript"
date: 2020-01-28 17:13:31
tags:
- javascript
description: "Let's talk about generator, coroutine, async/await and redux-saga..."
---

## what

Generator 是一种特殊的函数，普通的函数只能返回一个值，而它被调用后会返回一个遍历器对象(iterator)，这个对象可以通过调用 next 方法来不断获得内部抛出的每一个值。

下面是一个一直返回递增整数的 generator：

```js
function* gen() {
  let i = 0;

  while (true) {
    yield ++i;
  }
}

const g = gen();

g.next();  // -> {value: 1, done: false}
g.next();  // -> {value: 2, done: false}
g.next();  // -> {value: 3, done: false}
g.next();  // -> {value: 4, done: false}
g.next();  // -> {value: 5, done: false}
// ...
```

可以看到每次调用 next 方法，执行到 yield 时会将紧跟在 yield 后面的表达式的值，作为返回的对象的value属性值，后续的操作就暂停了，直到下一次调用 next 方法再重复这一过程。

对于 Iterator 对象，都可以使用`for...of` 循环, `...` 扩展运算符，解构赋值和 `Array.from()` 方法。

```js
function* numbers () {
  yield 1
  yield 2
}

// 扩展运算符
[...numbers()] // [1, 2]

// Array.from 方法
Array.from(numbers()) // [1, 2]

// 解构赋值
let [x, y] = numbers();
x // 1
y // 2

// for...of 循环
for (let n of numbers()) {
  console.log(n)
}
// 1
// 2
```

由于 yield 表达式本身总是返回 undefined，因此提供了一个方法来使得外部可以注入数据来修改上下文，那就是让 next 方法可以带一个参数：

```js
function *gen() {
  const a = yield 'hello';
  console.log(a);
}

cont g = gen();
g.next(); // { value: 'hello', done: false }
setTimeout(() => g.next('hi'), 1000)  // 此时 a => 'hi'   一秒后打印‘hi'
```

当然除了 `next()`，还提供了 `throw()` 和 `return()`，他们的本质其实是一样的，都是让 generator 恢复执行，并从外部注入不同的值来替换 yield 表达式。

Generator 内部也可以使用 `yield*` 语法来调用另外一个 generator：

```js
function* foo() {
  yield 'a';
  yield 'b';
}

function* bar() {
  yield 'x';
  yield* foo();
  yield 'y';
}

// 等同于
function* bar() {
  yield 'x';
  yield 'a';
  yield 'b';
  yield 'y';
}
```

## use case

可以看到 Generator 可以顺序的执行每一个任务，并且中途可以将执行权交给 yield 后的表达式，暂停后续操作，等到其完成后再拿回执行权继续后续操作。这使得在单线程的 JavaScript 环境中，可以很方便的控制复杂的异步流程。

```js
// callback style
step1(function (value1) {
  step2(value1, function(value2) {
    step3(value2, function(value3) {
      step4(value3, function(value4) {
        // Do something with value4
      });
    });
  });
});

// promise style
Promise.resolve(step1)
  .then(step2)
  .then(step3)
  .then(step4)
  .then(function (value4) {
    // Do something with value4
  }, function (error) {
    // Handle any error from step1 through step4
  })
  .done();

// generator style
function* longRunningTask(value1) {
  try {
    var value2 = yield step1(value1);
    var value3 = yield step2(value2);
    var value4 = yield step3(value3);
    var value5 = yield step4(value4);
    // Do something with value4
  } catch (e) {
    // Handle any error from step1 through step4
  }
}
```

当然 generator 还需要我们一步一步手动调用 next 方法，但是我们可以写一个函数来调度这个流程，实际上已经有了现成的可以用，[co](https://github.com/tj/co) 就是这样的一个流程调度器。

## how co works

co 取自 coroutine，中文一般翻译为协程，关于协程的更多内容推荐查看[这篇文章](https://dev.to/thibmaek/explain-coroutines-like-im-five-2d9)

co 提供了一个函数，让你传入一个 generator 就可以自动执行：

```js
const co = require('co');

co(function *(){
  // resolve multiple promises in parallel
  const a = Promise.resolve(1);
  const b = Promise.resolve(2);
  const c = Promise.resolve(3);
  const res = yield [a, b, c];
  console.log(res);
  // => [1, 2, 3]
});
```

yield 后的表达式可以支持一系列的 yieldable 对象：

- promises
- thunks (functions)
- array (parallel execution)
- objects (parallel execution)
- generators (delegation)
- generator functions (delegation)

具体的介绍可以查看[文档](https://github.com/tj/co#yieldables)

co 是如何实现的呢？我们需要一个容器，来让每一次 yield 的操作有了结果以后，能够自动调用 next 来继续执行后续的操作。

我们可以自己尝试写一个非常简单的实现，希望它可以像下面这样执行，先等待一秒之后打印 1，然后再等待一秒之后打印错误：

```js
co(function* gen() {
  const a = yield asyncJob(1000);
  console.log(a); // 等待 1000ms 后打印 1

  try {
    yield asyncErr(1000);
  } catch (e) {
    console.log(e); // 再等待 1000ms 后打印 error
  }
});
```

首先来模拟一下这两个异步操作：

```js
const asyncJob = (delay, callback) => setTimeout(() => {
  const data = 1;
  callback(undefined, data);
}, delay);

const asyncErr = (delay, callback) => setTimeout(() => {
  const err = new Error('oops');
  callback(err);
}, delay);
```

上面是两个典型的类似 nodejs 回调风格的异步逻辑，我们显然没有办法直接通过 `yield asyncJob(delay, callback)` 这样的方式来调用，因为它直接就执行了，而实际上我们需要把它延迟到 next 方法里再去真正的调用 `setTimeout`。因此就需要对它进行一点改动：

```js
const asyncJob = delay => callback => setTimeout(() => {
  const data = 1;
  callback(undefined, data);
}, delay);

const asyncErr = delay => callback => setTimeout(() => {
  const err = new Error('oops');
  callback(err);
}, delay);
```

可以看到这样的话，当我们执行到 `yield asyncJob(1000)` 时，generator 返回的 iterator 对象是 `{ value: callback => setTimeout(...), done: false }`，此时我们再通过 `result.value()` 就可以真正执行异步逻辑了。

很容易就能实现一个这样的 co 函数：

```js
function co(gen) {
  const g = gen();

  const next = (err, data) => {
    if (err) g.throw(err);

    const result = g.next(data);
    if (result.done) {
      return;
    }

    try {
      result.value(next);
    } catch (e) {
      g.throw(e);
    }
  }

  next();
}
```

之前对异步操作的修改其实就涉及到 thunk 的概念了。

`asyncJob` 和 `asyncErr` 在调用后返回了一个只接受 callback 作为参数的函数，在这里 `asyncJob` 和 `asyncErr` 就是 thunk，他们延迟了真正的异步逻辑（即 `setTimeout`）的调用，`setTimeout` 实际上是在我们定义的 `next` 函数里，通过`result.value(next)` 在被调用的。

但这个的 co 实现有个限制是 yield 后的表达式结果要接受一个类似 nodejs 的 error first 风格的回调函数作为参数。

co 的文档中有提到：

> Thunks are functions that only have a single argument, a callback.

实际上 co 里的 thunk 是为了兼容 nodejs 中的 callback 风格 API 的，这样我们只需要把 callback 风格的 API 全部包装成 thunk 就可以直接通过 yield 来使用了。

```js
// nodejs
const readFile = (fileName, callback) => fs.readFile(fileName, callback);

// make it thunk
const readFileThunk = fileName => callback => fs.readFile(fileName, callback);

co(function* () {
  const data = yield readFileThunk(fileName);
  console.log(data);
});
```

我们也可以写一个 thunkify 函数来负责所有的转换：

```js
function thunkify(fn) {
  return function(...args) {
    return callback => fn.call(this, ...args, callback);
  }
}
```

另外熟悉 redux 的同学肯定知道 redux-thunk，它的文档里是这么写的：

> A thunk is a function that wraps an expression to delay its evaluation.

更多关于 thunk 概念的内容可以自行查阅资料。

但我们的 co 光支持 thunk 肯定不够，它的存在本身就是单纯为了兼容性，对于异步操作，现在更常见更主流的是使用 promise。

由于 thunk 函数也可以很简单就能转换成 promise，实际上我们可以把 generator 中 yield 出来的所有 value 全部都转换成 promise，然后统一处理：

```js
function co(gen){
  const g = gen();

  return new Promise((resolve, reject) => {
    function onFulfilled(res) {
      let ret;
      try {
        ret = g.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
      return null;
    }

    function onRejected(err) {
      let ret;
      try {
        ret = g.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }


    function next(ret) {
      if (ret.done) return resolve(ret.value);
      const value = toPromise(ret.value);
      return value.then(onFulfilled, onRejected);
    }

    onFulfilled();
  });
}

co(gen);
```

接下来就可以更方便的使用了：

```js
const asyncJobPromise = delay => new Promise(resolve => setTimeout(() => resolve(1), delay));
const asyncErrPromise = delay => new Promise((resolve, reject) => setTimeout(() => reject(new Error('oops')), delay));

function* gen() {
  const a = yield asyncJobPromise(1000);
  console.log('a', a);

  const b = yield asyncJob(1000);
  console.log('b', b);

  try {
    yield asyncErrPromise(1000);
  } catch (e) {
    console.log(e);
  }

  try {
    yield asyncErr(1000);
  } catch (e) {
    console.log(e);
  }
}

co(gen);
```

co 的核心实现其实就是这样，除了将 thunk 函数转换为 promise 以外，还可以不断完善，比如添加对数组的支持，这样可以通过 yield 一个 promise 组成的数组来完成并发的异步操作。

具体的实现可以去查看 co 的源码。

## async/await

前面的 gen 函数，实际上已经很我们现在常用的 async/await 标准非常相似了, 我们只需要把函数声明加一个 async，然后 yield 替换成 await 就可以了，当然这一标准并不支持 await 一个 thunk：

```js
async function gen() {
  const a = await asyncJobPromise(1000);
  console.log('a', a);

  try {
    await asyncErrPromise(1000);
  } catch (e) {
    console.log(e);
  }
}

gen();
```

这样的 async 函数执行时就会交给支持这一标准的 js 解释器自动执行了(例如 node >= v7.6.0)。所以你可以简单的把 async/await 理解为 generator 的语法糖。

## saga

讲清楚了 Generator，我们就可以来看看 redux-saga 了。这里不赘述 redux-saga 的使用方法，具体可以查看文档。saga 通过 yield 各种各样的 effect 来处理复杂的异步或者副作用逻辑，而 effect 实际上就是一个描述异步逻辑的 Plain Object，就像 redux 中的 action 实际上就是一个描述如何修改状态 Plain Object。

redux-saga 提供了很多 Effect helper 来帮助你创建 effect，如 call、put、take 等等。比如 `yield call(fetchSomething)` 可能结果类似这样：

```js
{
  isEffect: true,
  type: 'CALL',
  fn: fetchSomething
}
```

一样的，类似 redux action，effect 只是描述了意图，并不是真正的执行这个操作，真正的执行是在前文类似的 `next` 或者 `onFulfilled` 函数中调用的。但我们可以通过收集各种各样的 effect 来统一调度以实现更复杂的异步逻辑。

例如 `yield take('someActionType')`，saga 会在此处堵塞，只有在 `store.dispatch({type: 'someActionType'})` 以后才会执行后续的逻辑，这么一看就非常像一个 event emitter 了，那么这个所谓的 「event」 是在哪里被订阅，又是怎么被消费的呢？

再比如，每次 yield 都会阻塞后续的执行直到这个 yield 后的表达式执行完成，但是用户可能还是希望能够使用非阻塞的异步逻辑，也就是 reudx-saga 的 fork model 要如何实现呢？

另外还有关于任务的取消等其他的复杂场景需要满足，我打算下篇文章再具体写写。

## reference

- [http://es6.ruanyifeng.com/#docs/generator](http://es6.ruanyifeng.com/#docs/generator)
- [https://dev.to/thibmaek/explain-coroutines-like-im-five-2d9](https://dev.to/thibmaek/explain-coroutines-like-im-five-2d9)
- [https://devarea.com/linux-io-multiplexing-select-vs-poll-vs-epoll/](https://devarea.com/linux-io-multiplexing-select-vs-poll-vs-epoll/)
- [https://en.wikipedia.org/wiki/Thunk](https://en.wikipedia.org/wiki/Thunk)
- [https://daveceddia.com/what-is-a-thunk/](https://daveceddia.com/what-is-a-thunk/)
- [https://github.com/tj/co](https://github.com/tj/co)
- [https://github.com/reduxjs/redux-thunk](https://github.com/reduxjs/redux-thunk)
- [https://github.com/redux-saga/redux-saga](https://github.com/redux-saga/redux-saga)
