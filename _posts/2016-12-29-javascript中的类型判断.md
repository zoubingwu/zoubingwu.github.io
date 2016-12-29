---
layout: post
title: "javascript中的类型判断"
image: ''
date:   2016-12-29 22:27:18
tags:
- javascript
description: ''
categories:
- Javascript
serie: learn
---

突然想起来好久没写博客了，最近复习了下JavaScript高级程序设计，关于对数据类型的判断方法在这里总结一下，主要就是以下三种。

- `typeof`

  最基础的方法，比如：

  ```javascript
  var a = 1;
  typeof a; // number
  ```

  结果只能输出string，number，boolean，undefined，function，object，所以如果是对象的话，需要进一步判断详细的类型就不够用了。

- `instanceof`

  `instanceof`是用来判断是否是某对象的实例的，比如：

  ```javascript
  var a = [1, false, null];
  a instanceof Array; // true
  ```

  这个就需要事先对类型有一个了解，然后再去判断是否属实了。

- `Object.prototype.toString.apply()`

  最后一种则是对原型对象采用toString方法，可以输出更详细的结果，比如：

  ```javascript
  var a = undefined;
  Object.prototype.toString.apply(a); //[object Undefined]
  var b = new Date();
  Object.prototype.toString.apply(b); //[object Date]
  ```

最后如果需要判断某一数据的具体类型，可以采用下面这个函数：

```javascript
function typeOf(item) {
  	//对于IE8以下不支持null和undefined检测的hack
  	if (item === null) {
      return "null";
  	}
  	if (item === undefined) {
      return "undefined";
  	}
	var result = Object.prototype.toString.apply(item);
	result = result.slice(8, -1).toLowerCase();
  	return result;
}
```

*ref：*

*javascript高级程序设计（第3版）*

*[MDN*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)