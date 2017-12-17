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


