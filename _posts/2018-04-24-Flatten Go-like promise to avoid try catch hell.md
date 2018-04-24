---
layout: post
title: "Flatten Go-like promise to avoid try catch hell"
date: 2018-04-24 14:29:31
tags:
- javascript
- promise
description: "A interesting Go-like pattern to avoid try/catch hell in async/await."
---

## Intro

异步代码从最早的 callback hell，到现在的 ES7 我们已经可以用 async/await 来像编写同步代码一样优雅的编写了。

什么是回调地狱（callback hell）呢，看下面的代码就一目了然了：

```js
function AsyncTask() {
   asyncFuncA(function(err, resultA){
      if(err) return cb(err);

      asyncFuncB(function(err, resultB){
         if(err) return cb(err);

          asyncFuncC(function(err, resultC){
               if(err) return cb(err);

               // And so it goes....
          });
      });
   });
}
```

这样的代码可读性和维护性都非常差，后来社区又引入了 promise：

```js
function asyncTask(cb) {
   asyncFuncA.then(AsyncFuncB)
      .then(AsyncFuncC)
      .then(AsyncFuncD)
      .then(data => cb(null, data)
      .catch(err => cb(err));
}
```

这样看上去确实是干净多了，但实际的开发中写多了会发现非常复杂的异步情况时，大量的 then 写起来还是有点累赘，而且很多时候的流程控制并非像这样线性的考虑，可能会出现很多分支。

ES7 终于推出了 async/await 标准，虽然浏览器并不直接支持，但我们使用 babel transpiler 或者 typescript 都可以享受这一特性。

```js
async function asyncTask(cb) {
    const user = await UserModel.findById(1);
    if(!user) return cb('No user found');

    const savedTask = await TaskModel({userId: user.id, name: 'Demo Task'});

    if(user.notificationsEnabled) {
        await NotificationService.sendNotification(user.id, 'Task Created');
    }

    if(savedTask.assignedUser.id !== user.id) {
        await NotificationService.sendNotification(savedTask.assignedUser.id, 'Task was created for you');
    }

    cb(null, savedTask);
}
```

同样的还有基于 Generator 的解决方案：

```js
*function asyncTask() {
  yield task1();
  yield task2();
  yield task3();
  yield task4();
}
```

可以看到我们编写异步代码简直和同步代码几乎没有什么区别。代码看上去也干净利落，但有一个问题是，如果需要处理异步调用中的错误情况的话，只能使用 try catch，导致生产中我们的代码可能变成这样：

```js
async function asyncTask(cb) {
    try {
       const user = await UserModel.findById(1);
       if(!user) return cb('No user found');
    } catch(e) {
        return cb('Unexpected error occurred');
    }

    try {
       const savedTask = await TaskModel({userId: user.id, name: 'Demo Task'});
    } catch(e) {
        return cb('Error occurred while saving task');
    }

    if(user.notificationsEnabled) {
        try {
            await NotificationService.sendNotification(user.id, 'Task Created');
        } catch(e) {
            return cb('Error while sending notification');
        }
    }

    if(savedTask.assignedUser.id !== user.id) {
        try {
            await NotificationService.sendNotification(savedTask.assignedUser.id, 'Task was created for you');
        } catch(e) {
            return cb('Error while sending notification');
        }
    }

    cb(null, savedTask);
}
```

像 dva 这样的封装了 React/Redux-saga 的框架提供了一个捕获 effects 中错误的 onError hook，但使用一些其他框架时往往还是需要使用 try catch，老实说大量的重复编写这样的代码会感觉非常糟心。

## Go-like pattern

在 Golang 中是没有 try catch 的，因为它通过返回多个值来解决这一问题，典型的 Go 代码是这样的：

```go
data, err := db.Query("SELECT ...")
if err != nil { return err }
```

随着 ES6 中解构赋值这一特性的引入，很快就有想到了像 Go 这样返回一个 error 和 resolve 值组成的数组这样有趣的方案：

```js
const [err, data] = await someTask();
if (err) return;
```

由于 await 出错时如果没有 try catch 的话会静默的退出当前函数执行，因此我们需要一个简单的转换工具函数：

```js
// to.js
export default function to(promise) {
   return promise.then(data => [null, data])
   .catch(err => [err, null]);
}
```

接下来就可以愉快的改写前面的代码了：

```js
import to from './to.js';

async function asyncTask(cb) {
    let err, user, savedTask;

    [err, user] = await to(UserModel.findById(1));
    if(!user) return cb('No user found');

    [err, savedTask] = await to(TaskModel({userId: user.id, name: 'Demo Task'}));
    if(err) return cb('Error occurred while saving task');

    if(user.notificationsEnabled) {
       const [err] = await to(NotificationService.sendNotification(user.id, 'Task Created'));
       if(err) return cb('Error while sending notification');
    }

    cb(null, savedTask);
}
```

最后的代码看上去舒服多了有没有！当然上面这样的只是一个简单的工具函数，生产环境使用的话可能需要做更多的处理。

虽然平时的工作中还不能使用，但这样的 Go 风格代码我个人非常喜欢，感觉非常有意思。

## Ref：

- [https://github.com/coleturner/promise.flatten#readme](https://github.com/coleturner/promise.flatten)

- [https://github.com/scopsy/await-to-js#readme](https://github.com/scopsy/await-to-js#readme)