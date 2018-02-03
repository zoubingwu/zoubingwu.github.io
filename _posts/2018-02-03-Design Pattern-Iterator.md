---
layout: post
title: "Design Pattern - Iterator"
date: 2018-02-03 22:12:21
tags:
- patterns
description: "Introduction about the iterator pattern."
---

## 前言

最近正好学习 Rxjs ，感觉这种新的范式对我来说非常有意思，但涉及到的知识点也是非常之多。之前也写过一些 fp、观察者模式等，在 Rxjs 中就有非常多的运用，这次来写写另一种常见的迭代器模式。

其实我们以前编写的代码就有很多迭代器模式的运用，迭代这个概念只要是刚开始学习循环的时候就会接触到。而迭代器模式就是不暴露一个对象的内部表示，而使用其提供的一个方法来顺序的访问这个对象中的各个元素。在高级的编程语言中，基本都有内置的迭代器实现。

## 简介

jQeury 就提供了一个基本的 each 函数，来循环访问聚合对象中的各个元素。我们可以自己很容易就简单的实现一个这样的函数，它接受两个参数，第一个是被循环的数组，第二个就是每一次循环触发的回调函数。

```js
function each(arr, callback) {
  for (let i = 0, len = arr.length; i < len; i++) {
    callback.call(arr[i], i, arr[i]);
  }
}

each([1, 2, 3], function(index, element) {
  console.log([index, element]);
})
```

这个刚刚编写好的 each 函数属于内部迭代器，each 函数的内部已经定义好了迭代的规则，整个的迭代过程都是由其控制的，而外部只需要最初的一次调用就可以了。这种迭代器使用起来非常方便，因为我们不用关心内部的实现，调用一次就好了，这也刚好是它的缺点，比如我们就不能同时迭代两个数组了。

比如我们现在的有一个新的需求，要判断两个数组里的元素的值是否完全相等，如果不能改写 each 函数的内部那就只能通过这个传入的回调函数来比较丑陋的实现了：

```js
const a = [1, 2, 3, 4];
const b = [1, 3, 4, 5];

function isSameArray(a, b) {
  if (a.length !== b.length) return false;

  let result = true;
  each(a, (i, n) => {
    if (n !== b[i]) {
      result = false;
    }
  });

  return result;
}

isSameArray(a, b); // false
```

外部迭代器必须显示的请求迭代下一个元素，比如很典型的 generator，调用起来更复杂，但也增加了迭代器的灵活性，我们可以手工控制迭代器的过程或者顺序。

我们可以利用 generator 来改写上面的 compare 函数：

```js
function *iterator(array) {
  let i = 0, len = array.length;
  while(i < len) {
    yield array[i];
    i++;
  }
}

function compare(a, b) {
  let result = true;
  let i1 = a.next();
  let i2 = b.next();
  while(!i1.done && !i2.done) {
    if (i1.value !== i2.value) {
      result = false;
    }
    i1 = a.next();
    i2 = b.next();
  }
  return result;
}

const iterator1 = iterator([1,2,3,4,5]);
const iterator2 = iterator([1,3,4,2,5]);

compare(iterator1, iterator2);
```

迭代器模式不止可以迭代数组，还可以迭代很多的类数组对象，实际上只需要这个对象拥有 length 属性而且可以用下标访问，那就可以被迭代。

在 javascript 中因为语言本身的特性，我们还可以轻松的实现倒序迭代和中止迭代。

迭代器模式是一种相对来说比较简单的模式，简单到我们其实天天在使用而根本意识不到它是一种设计模式。
