---
layout: post
title: "Build your own observable"
date: 2018-03-25 16:18:25
tags:
- rxjs
- observable 
description: "Understand observable by building your own one."
---

## Introduction

> The observer pattern is a software design pattern in which an object, called the subject, maintains a list of its dependents, called observers, and notifies them automatically of any state changes, usually by calling one of their methods. (Wikipedia)

Observer 模式是一种广泛使用的软件设计模式，由一个对象来管理它的各种依赖，使其能够在状态变化的时候自动调用 Observer 来获得变化的通知。

### Observable And Observer

我个人的理解， Observable 就是一个函数，它接受一个 Observer，并且返回一个函数。这个函数就类似 Generator 可能会不断的，也许是同步，也许是异步的不断 “返回” 值，如果你对这些值有兴趣的话，你就可以通过注册一个 Observer 来订阅这些值。

它的 shape 其实是很简单的：

- 首先它是一个函数；
- 它需要有一个Observer。什么是 Observer 呢，就是一个有着 `next`, `error`，`complete` 三个方法的 Object，来给 Observable 在适当的时机调用，分别对应着产生新的值，发生错误，和结束时这三种时机；
- 它返回一个取消的函数。

### Pull vs Push

在 Rxjs 的[文档](http://reactivex.io/rxjs/manual/overview.html)中提到了这个 Pull 和 Push 系统。

![Push vs Pull]({{site.url}}/assets/images/2018-03-25/1.jpg)

我们举一个生活中常见的例子，智能手机大家都知道，其中的 push notification 动作，就是一个典型的推送系统，用户（Consumer）来接受服务端（Producer）的消息推送，这个场景中，用户是被动的，他不知道什么时候会接受到消息，而是由服务端来决定什么时候，发送什么样的信息给用户。

在 Javascript 中，Promise 就是一个最常见的推送系统。在 Promise 内部来决定何时把需要的值来 “推送” 给回调。

Pull 系统则不同，是由 Consumer 来主动请求，然后 Producer 返回需要的数据，这个过程中， Consumer 是主动的，而 Producer 被动等待着请求。 比如我们在命令行敲出 `git pull`，就是一个主动拉取的动作。

所有的 JS 函数都是一个 Pull 系统，函数本身是一个数据的 Producer，而调用这个函数的代码通过主动的调用这个函数来获取一个单一的返回值，这个值是单一的，这一点非常重要，它意味着我们要再获取，就只能够再次重复的去调用。

因此就有了 Generator，这是 ES2015 中提出来的另一种 Pull 系统，它每一次调用 next 方法，都是作为 Consumer 来主动的拉取数据，只是不同于函数的单一返回值，它可以返回 0 个到无数个值。

因此可以发现，我们一直缺少一个角色，就是能够返回多个值的 Push 系统，而 Observable 的出现，就补足了这缺掉的一部分。每当有新的值产生的时候，Observable 会主动的 “Push” 给你，而不需要你来去再主动 “Pull”。

### Basic Implementation

这篇文章先不说现在的 Observable 为什么要这么设计，我们首先来按照其 API 自己实现一下。我们期望的代码是这样运行的：

```js
// 首先定义一个 Observable
const dataStream$ = new Observable(observer => {
  observer.next(1);
  setTimeout(() => {
    observer.next(2);
    observer.complete();
  }, 2000)
  observer.next(3);
});

// 定义 Observer，这里我们只是打印出来
const observer = {
  next: x => console.log(x),
  error: err => console.error(err),
  complete: () => console.log('done'),
}

// 然后订阅它
dataStream$.subscribe(observer);

// 这一段代码期望的输出值，应该是 1， 3， 2，'done'。
```

可以看到它接受一个函数作为参数，函数内部定义了数据是如何产生的，同时还提供了一个 `subscribe` 方法来订阅这个数据的变化，那这样一个简单的实现还是比较容易的：

```js
class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  subscribe(observer) {
    return this._subscribe(observer);
  }
}
```

可以看到初始化时我们只保存了传入函数的引用，等到调用 subscribe 方法时才调用了传入的函数，这也解释了为什么 Observable 是 **Lazy** 的。就是如此简单，只需要这么几行代码，我们就自己实现一个自己的 Observable，当然为了更方便的去使用，我们可以为其添加更多的功能。

### Operators

Operators，同样也是函数，它返回了一个新的 Observable，并且已经订阅了原有的 Observable。比如我们添加一个 map 方法来把每次的值作一个映射，让它按照我们定下的规则来产生新的值。

```js
// 在 class 内添加下面的 map 方法, 为了能够连锁调用，我们需要返回一个新的 Observable。
map(mapFn) {
  return new Observable(observer => {
    return this.subscribe({
      next: val => observer.next(mapFn(val)),
      error: err => observer.error(err),
      complete: () => observer.complete(),
    })
  })
}

// 然后稍微改写之前的订阅
dataStream$
  .map(val => val * 10)
  .subscribe(observer);

// 输出 10, 30, 20, 'done'
```

### Creating Observables

前面的例子里我们是手动的创造了一个 Observable，手动使用 `observer.next(1)` 这样的方式来把值传入进去，但经常我们可能需要将事件等转化为一个 Observable，Rxjs 提供了许多的方式来创造一个 Observable，比如 `fromEvent`，我们其实也可以很容易就能自己实现：

```js
// 继续把 fromEvent 方法添加到 class 内作为静态方法，同样的返回一个新的 Observable
static fromEvent(element, event) {
  return new Observable(observer => {
    const handler = e => observer.next(e);
    element.addEventListener(event, handler);

    return () => {
      element.removeEventListener(event, handler);
    };
  });
}
```

然后我们就可以像文档开头一样愉快的转化了：

```js
const button = document.getElementById('button');
const click$ = Observable.fromEvent(button, 'click');

const unsubscribe = click$.subscribe({
  next: () => console.log('clicked!')
})

// 30秒后取消订阅，再点击也不会有反应了。
setTimeout(() => unsubscribe(), 30000);
```

如果要把一个数组转化呢，也非常简单：

```js
static fromArray(array) {
  return new Observable(observer => {
    array.forEach(val => observer.next(val));
    observer.complete();
  });
}
```

再实现一个从 Promise 的转化：

```js
static fromPromise(promise) {
  return new Observable(observer => {
    promise.then(val => {
      observer.next(val); observer.complete();
    })
    .catch(e => {
      observer.error(val); observer.complete();
    });
  })
}
```

现在假设我们有一个更复杂的需求，我们需要把两个 Observable 合并成一个，如果只是像下面这样单纯的使用 map，那么得到的值将会也变成了 Observale：

```js
const promise = val => {
  return new Promise(resolve => {
    setTimeout(() => resolve(val), 3000);
 });
}

const data$ = Observable.fromArray([1,2,3]).map(val =>  Observable.fromPromise(promise(val)));
```

实际上我们需要的是同时做合并和 map 两个操作：

```js
// 同样返回新的 observable
mergeMap(anotherFunctionThatThrowsValues) {
  return new Observable(observer => {
    return this.subscribe({
      next(val) {    
        anotherFunctionThatThrowsValues(val).subscribe({
          next(val) { observer.next(val) },
          error(e) { observer.error(e) } ,
          complete() { observer.complete() } 
        });
      },
      error(e) { observer.error(e) } ,
      complete() { observer.complete() } 
    });
  });
}
```

最后本文的源码可以在 [https://github.com/shadeofgod/build-your-own-observable](https://github.com/shadeofgod/build-your-own-observable) 查看。

### ref：

- [http://reactivex.io/rxjs/manual/overview.html](http://reactivex.io/rxjs/manual/overview.html#Observable)

- [Learning Observable By Building Observable](https://medium.com/@benlesh/learning-observable-by-building-observable-d5da57405d87)

- [JavaScript — Observables Under The Hood](https://netbasal.com/javascript-observables-under-the-hood-2423f760584)
