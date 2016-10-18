---
layout: post
title:  "Javascript中操作数组的一些常用方法总结"
image: ''
date:   2016-10-18 23:28:11
tags:
- Array
description: ''
categories:
- Javascript
serie: learn
---

### 从头部或尾部添加或删除元素

- #### Array.prototype.pop()

  删除一个数组中的最后的一个元素，并且返回这个元素。

  **pop()**方法删除掉数组中的最后一个元素，并且把这个元素返回。

  注意原数组此时已经被改动，返回的元素保持着原有的类型，并不会存放在一个数组中，不要和后面的方法混淆了。

  ```javascript
  var a = [1, 2, 3, 4, 5];
  var b = a.pop();
  console.log(a); // a = [1, 2, 3, 4];
  console.log(b); // b = 5; typeof b = number;
  ```

- #### Array.prototype.push()

  **push()**方法可以添加一个或多个元素到数组的尾部，并返回新的数组的长度。

  需要添加的元素直接作为参数，用逗号隔开。

  ```javascript
  var a = ["a", "b", "c"];
  var b = a.push(1, 2, 3);
  console.log(a); //a = ["a", "b", "c", 1, 2, 3];
  console.log(b); //b = 6;
  ```

- #### Array.prototype.shift()

  **shift()**方法删除数组的首个元素，并返回这个元素。该方法会改变数组的长度。

  如果数组为空的话，会返回`undefined`.

  ```javascript
  var a = [];
  var b = [1, 2, 3];
  var c = a.shift();
  var d = b.shift();
  console.log(a); // a = []
  console.log(b); // b = [1, 2]
  console.log(c); // c = undefined
  console.log(d); // d = 1
  ```

- #### Array.prototype.unshit()

  **unshift()** 方法在数组的开头添加一个或者多个元素，并返回数组新的 length 值。

  类似于push()方法，只是位置在数组的开头。

  ```javascript
  var a = ["a", "b", "c"];
  var b = a.unshift(1, 2, 3);
  console.log(a); //a = [1, 2, 3, "a", "b", "c"];
  console.log(b); //b = 6;
  ```



#### 

#### 