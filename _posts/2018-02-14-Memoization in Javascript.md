---
layout: post
title: "Memoization in Javascript"
date: 2018-02-14 12:33:21
tags:
- javascript
description: "Memoization is an optimization technique used primarily to speed up computer programs by storing the results of expensive function calls and returning the cached result when the same inputs occur again. "
---

### Introduction

函数是编程语言中不可或缺的重要部分，有了函数，我们才能复用各种代码。我们的程序通常都会由各种各样的函数组成，在需要的时候调用这些函数来实现各种功能。

但是某些函数的调用多次的代价可能是非常高昂的，比如说最简单的一个计算阶乘的递归函数。

比如：

```js
let times = 0;

function factorial(n) {
  if (n === 0 || n === 1) return 1;
  if (n === 2) return 2;

  console.log(`calculating ${++times} times`)

  return n * factorial(n - 1);
}

factorial(10)
factorial(10)
factorial(10)
factorial(10)
```

我们可以看到每一次我们调用，传入一个同样的参数，计算机都会重复的从头到尾计算一遍，哪怕之前已经计算过，知道了结果是什么。因此为了优化，自然有人就想到了，如果我们可以把每次计算的结果缓存到内存里，如果参数没有改变，那就直接返回这个缓存的结果就好了。这是一种以空间换时间的优化方式。

我们可以先看一个更简单的例子：

```js
const double = n => n * 2;

const memoize = (fn) => {
  const cache = {}; // create a cache object

  return (n) => {
    if (n in cache) {
      console.log('we found it in cache!');
      return cache[n];
    }

    console.log('calculating ...');
    const result = fn(n);

    cache[n] = result; // store it in cache

    return result;
  }
}

const memoizedDouble = memoize(double);

memoizedDouble(4) // calculating ...
memoizedDouble(4) // we found it in cache!
memoizedDouble(5) // calculating ...
memoizedDouble(5) // we found it in cache!
memoizedDouble(4) // we found it in cache!
```

这也是所谓 javascript 闭包的典型运用，上面的 memoize 函数实际上是实现了一个 size 无限大的缓存，只要不同的参数，运算过一次以后，都会存入缓存中。

但是我们传入一个递归函数进去是无法实现目的的，这个时候应该确保递归时，也应调用这个记忆后的函数。

```js
// same memoize function
const memoize = (fn) => {
  const cache = {}; // create a cache object

  return (n) => {
    if (n in cache) {
      console.log('we found it in cache!');
      return cache[n];
    }

    console.log('calculating ...');
    const result = fn(n);

    cache[n] = result; // store it in cache

    return result;
  }
}

const factorial = memoize(
  (n) => {
    if (n === 0) return 1;
    return n * factorial(n - 1);
  }
)

factorial(10) // calculating ... 
factorial(10) // we found it in cache!
```

可以发现实际上缓存中实际上保存从 1 到 10 所有的阶乘结果。

缓存这种存储某些数据以给将来的使用这一概念，其实上运用到的地方非常多，比如 http 缓存，而 Memoization 基本上就是这种特定的，缓存函数返回值的技术。

### when to memoize

通常我们并不会在所有的地方都使用这种空间换时间的优化技术，一般来说有下面几个规律：

- 函数首先必须是一个 pure function，每次对于相同的输入，都应该有相同的返回。

- 因为是为了以空间交换时间，因此函数必须有着有限的输入范围，来让缓存的值可以呗被频繁的多次使用。

- 最合适的使用时机，应该是针对需要大量计算的 heavy computational function, 可以极大的提高性能。

如果对 React 相关生态的比较熟悉的话，就知道有一个 Reselect 的工具库，来帮助优化从 state 树提取数据映射到相关组件这一过程。它的源码也非常短小精悍，值得一读。

下一篇文章，我们就来写写 Reselect 的使用和源码解析。
