---
layout: post
title: "关于Javascript中的this"
image: ''
date:   2016-12-09 20:27:18
tags:
- javascript
description: ''
categories:
- Javascript
serie: learn
---

- ### 全局环境

浏览器中:

```javascript
console.log(this);
// Window {speechSynthesis: SpeechSynthesis, caches: CacheStorage, localStorage: Storage, sessionStorage: Storage, webkitStorageInfo: DeprecatedStorageInfo…}
```

nodejs:

```javascript
console.log(this);
// global
```

全局环境下this总是指向全局对象，在浏览器环境中即window，node中即global

- ### 函数中执行

函数中直接使用：

```javascript
function test() {
  console.log(this);
};
test();
// Window {speechSynthesis: SpeechSynthesis, caches: CacheStorage, localStorage: Storage, sessionStorage: Storage, webkitStorageInfo: DeprecatedStorageInfo…}
```

严格模式下：

```javascript
'use strict';
(function () {
  console.log(this);
})();
// undefined
```

函数中直接使用时也是指向全局对象，但是在严格模式下为了消除一些不严谨的行为，使this指向了undefined

- ### 对象的方法

```javascript
var obj = {
  name: 'john',
  foo: function() {
    console.log(this.name);
  }
}
obj.foo();
// 'john'
```

此时，this指向了这个对象本身。

但是，如果把这个方法赋值给一个变量，再直接调用这个变量，这时候就和这个对象没关系了，因为这个变量保存的是函数的引用，全局内调用时就被当成了普通的函数直接调用：

```javascript
var obj = {
  name: 'john',
  foo: function() {
    console.log(this);
  }
}
var test = obj.foo;
test();
// Window
```

注意：this不像变量，是无法向下传递的：

```javascript
var obj = {
  name: 'john',
  foo: function() {
    (function(){
      console.log(this);
    })()
  }
}
obj.foo();
// Window
```

同样在setTimtout中：

```javascript
var obj = {
  name: 'qiutc',
  foo: function() {
    console.log(this);
  },
  foo2: function() {
    console.log(this);
    setTimeout(this.foo, 1000);
  }
}

obj.foo2();
// obj, window
```

第一次打印obj，this指向的是对象本身。

第二次却指向了window，因为settimeout也是一个函数，而this是不会向下传递的。为了解决这个问题，我们可以手动指定一个变量来保存this，根据函数作用域链，内部的函数依然可以使用这个变量：

```javascript
var obj = {
  name: 'john',
  foo: function() {
    console.log(this);
  },
  foo2: function() {
    console.log(this);
    var that = this;
    setTimeout(function() {
      console.log(this);  // Window
      console.log(that);  // Object {name: "john"}
    }, 1000);
  }
}
obj.foo2();
```

严格模式下又有不同：

```javascript
'use strict';
function foo() {
  console.log(this);
}
setTimeout(foo, 1);
// window
```

我们会发现这里并不是undefined，因为严格模式中，如果函数没有指定了的this，那么它会自动注入一个全局的上下文。当然如果之前指定了的话，就不会有这个隐式的操作了。

- ### 构造函数

```javascript
function Person(name) {
  this.name = name;
  console.log(this);
}
var p = new Person('john');
// Person {name: "john"}
var p2 = person('lucy') ;
// window
```

可以看到当使用new关键字来调用构造函数时，this指向了新建的实例化对象，而如果直接调用函数的话，这个this仍然指向了全局。

- ### call, apply, bind

这里介绍三个方法来改变this的指向。

1. call

   ```javascript
   fun.call(thisArg[, arg1[, arg2[, ...]]])
   ```

   它会立即执行函数，第一个参数是指定执行函数中 `this` 的上下文，后面的参数是执行函数需要传入的参数；

2. apply

   ```javascript
   fun.apply(thisArg[, [arg1, arg2, ...]])
   ```

   它会立即执行函数，第一个参数是指定执行函数中 `this` 的上下文，第二个参数是一个数组，是传给执行函数的参数（与 `call` 的区别）；

3. bind

   ```javascript
   var foo = fun.bind(thisArg[, arg1[, arg2[, ...]]]);
   ```

   它不会执行函数，而是返回一个新的函数，这个新的函数被指定了 `this` 的上下文，后面的参数是执行函数需要传入的参数；

   **这三个函数其实大同小异，总的目的就是去指定一个函数的上下文（this）**

下面举几个例子：

```javascript
// 为一个普通函数指定 this
var obj = {
  name: 'john'
};
function foo() {
  console.log(this);
}
foo.call(obj);
// Object {name: "john"}
```

第二个：

```javascript
// 为对象中的方法指定一个 this
var obj = {
  name: 'john',
  foo: function () {
    console.log(this);
  }
}
var obj2 = {
  name: 'lucy'
};
obj.foo.call(obj2);
// Object {name: "lucy"}
```

对于构造函数：

```javascript
function Person(name) {
  this.name = name;
  console.log(this);
}
var obj = {
  name: 'qiutc2222222'
};
var p = new Person.call(obj, 'qiutc');
// Uncaught TypeError: Person.call is not a constructor(…)
```

可以发现直接使用会报错，因为person.call并不是一个构造函数，换成bind话就不会报错了：

```javascript
function Person(name) {
  this.name = name;
  console.log(this);
}
var obj = {
  name: 'lucy'
};
var Person2 = Person.bind(obj);
var p = new Person2('john');
// Person {name: "john"}
console.log(obj);
// Object {name: "lucy"}
```

打印出来的是 `Person` 实例化出来的对象，而和 `obj` 没有关系，而 `obj` 也没有发生变化，说明，我们给 `Person` 指定 `this` 上下文并没有生效；

因此可以得出： **使用 bind 给一个构造函数指定 `this`，在 `new` 这个构造函数的时候，`bind` 函数所指定的 `this` 并不会生效**。