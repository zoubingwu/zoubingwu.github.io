---
layout: post
title: "Basic concepts of functional programming"
date: 2017-12-17 23:24:23
tags:
- javascript
- functional programming
description: "Functional programming is a programming paradigm that treats computation as the evaluation of mathematical functions and avoids changing-state and mutable data. It is a declarative programming paradigm, which means programming is done with expressions or declarations instead of statements."
---

## 引言

JavaScript 是一种典型的多范式编程语言，随着React的火热，函数式编程的概念也开始流行起来，RxJS、lodashJS、underscoreJS 等多种开源库都使用了函数式的特性。所以这篇文章总结一些函数式编程的基本概念。

### Pure function

纯函数对于相同的输入，永远会得到相同的输出，而且没有任何可观察的副作用，也不依赖外部环境的状态。

```javascript
// impure
var minimum = 21;

var checkAge = function(age) {
  return age >= minimum;
};

// pure
var checkAge = function(age) {
  var minimum = 21;
  return age >= minimum;
};
```

纯函数可以有效降低系统的复杂度，并且易于测试，还有很多诸如可缓存性等很棒的特性。

### Currying

柯里化的概念非常简单：调用一个函数来处理一部分参数，然后返回一个函数来处理剩下的参数。配合 ES6 中的箭头函数可以写出很优雅的代码。

```javascript
const add = x => y => x + y;

const increment = add(1);
var addTen = add(10);

increment(2);
// 3

addTen(2);
// 12

```

柯里化可以想像成一种 “预加载” 的函数，通过传递较少的参数，得到一个已经记住了这些参数的新函数，某种意义上讲，这是一种对参数的“缓存”，是一种非常高效的编写函数的方法。

### Composing

学会了使用纯函数以及如何把它柯里化之后，我们可能会写出下面这样的函数嵌套的地狱代码：

```javascript
a(b(c(d(e(f())))))
```

为了解决这种嵌套的问题，我们需要运用到函数的组合：

```javascript
//两个函数的组合
const compose = (fun1, func2) => x => func1(func2(x));

const add1 = x => x + 1;
const mul5 = x => x * 5;

compose(mul5, add1)(2);
// =>15 
```

React 相关的第三方工具库中就有 [Recompose](https://github.com/acdlite/recompose/) 这样一套工具，来解决 React 中多层 HoC 的嵌套写法。

### Point Free

函数无须提及将要操作的数据是什么样的，我们需要尽可能的减少中间变量。

```javascript
// not point free
var f = str => str.toUpperCase().split(' ');


// point free
var toUpperCase = word => word.toUpperCase();
var split = x => (str => str.split(x));

var f = compose(split(' '), toUpperCase);
```

这种风格能够帮助我们减少不必要的命名，让代码保持简洁和通用。当然，为了在一些函数中写出 Point Free 的风格，在代码的其它地方必然是不那么 Point Free 的，这个需要自己取舍。

### Declarative vs Imperative

命令式代码通过编写一条又一条指令去让计算机执行一些动作，这其中一般都会涉及到很多繁杂的细节，是典型的面向过程式。

而声明式则通过表达式的方式来声明我们想干什么，而不是通过一步一步的指示。

for 循环和 map 函数是典型的对比：

```javascript
// 命令式
var makes = [];
for (i = 0; i < cars.length; i++) {
  makes.push(cars[i].make);
}
// 声明式
var makes = cars.map((car) => car.make);
```

再看一个例子：

```javascript
// 命令式
var authenticate = function(form) {
  var user = toUser(form);
  return logIn(user);
};
// 声明式
var authenticate = compose(logIn, toUser);
```

虽然命令式的版本并不一定就是错的，但还是硬编码了那种一步接一步的执行方式。而 compose 表达式只是简单地指出了这样一个事实：用户验证是 `toUser`和 `logIn` 两个行为的组合。

## 总结

在实际的工作中经常会接触到ajax、DOM操作，NodeJS环境中读写文件、网络操作这些对于外部环境强依赖，有明显副作用的脏活，不可能完全遵循函数式的范式去书写日常的应用程序，但学习这种每一部分都能完美接合的理论，尝试去践行以一种通用的、可组合的组件来表示我们的特定问题，然后利用这些组件的特性来解决这些问题对于我们的代码能力会有很大的提升。
