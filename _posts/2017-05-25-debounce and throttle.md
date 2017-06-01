---
layout: post
title: "debounce and throttle"
image: ''
date: 2017-05-23 17:38:27
tags:
- javascript
description: ''
categories:
- javascript
serie: learn
---

最近研究了一下`lodash`和`underscore`的部分源码，其中关于`debounce`和`throttle`感觉是比较值得说一说的。因为项目中也经常需要监听`scroll`等事件，不做防抖这样的设置经常会出现一些奇怪的效果。

关于这两者的区别可以看看这个[demo](http://demo.nimius.net/debounce_throttle/)，简单来说就是一个是在动作完成后最后执行一次函数，而另一个就是在固定的时间区间内才执行一次，并不是每一次触发都会去执行绑定的函数。

先来说说`debounce`，简单实现的思路就是把每一次事件触发的函数放入一个定时器中，在下一次的触发时清除这个定时器，这样只有最后一次无法被清除从而执行。

```javascript
function debounce(fn, delay) {

  // 定时器
  var timer

  // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
  return function () {

    // 保存函数调用时的上下文和参数，传递给 fn
    var that = this
    var args = arguments

    // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
    clearTimeout(timer)

    // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
    // 再过 delay 毫秒就执行 fn
    timer = setTimeout(function () {
      fn.apply(that, args)
    }, delay)
  }
}
```

这样使用时可以把`debounce`作为回调添加给绑定的事件：

```javascript
$(document).on('scroll', debounce(function(e) {
	// 代码
}, 250))
```

`throttle`的概念其实也是类似于`debounce`，区别在于我们需要记录一下时间的间隔，如果距离上次执行事件响应的函数时间小于间隔的话就同`debounce`一样继续清除定时器，并继续将函数放入定时器，否则直接执行函数：

```javascript
function throttle(fn, threshhold) {

  // 记录上次执行的时间
  var last

  // 定时器
  var timer

  // 默认间隔为 250ms
  threshhold || (threshhold = 250)

  // 返回的函数，每过 threshhold 毫秒就执行一次 fn 函数
  return function () {

    // 保存函数调用时的上下文和参数，传递给 fn
    var that = this
    var args = arguments

    var now = +new Date()

    // 如果距离上次执行 fn 函数的时间小于 threshhold，那么就放弃
    // 执行 fn，并重新计时
    if (last && now < last + threshhold) {
      clearTimeout(timer)

      // 保证在当前时间区间结束后，再执行一次 fn
      timer = setTimeout(function () {
        last = now
        fn.apply(that, args)
      }, threshhold)

      // 在时间区间的最开始和到达指定间隔的时候执行一次 fn
    } else {
      last = now
      fn.apply(that, args)
    }
  }
}
```

使用的方法也和之前类似。

## 总结

`debounce` 强制只在某段时间内执行一次， `throttle` 强制函数以固定的速率执行。因此在处理一些高频率触发的事件的时候，它们都能极大提升性能和优化用户体验。