---
layout: post
title: "Understanding transducer in Javascript"
date: 2018-08-06 16:53:31
tags:
- javascript
- functional programming
- transducers
description: "How do transducers work underneath the hood? This article explores transducers using JavaScript code examples."
---

## What are transducers?

Transducer 是 transform 和 reducer 两个词的结合，熟悉 JavaScript 的同学都很了解 Array 的 reduce 方法了，我们有时候会需要遍历一个数组，将其变换结构后再 reduce 成最后需要的结果。

而 transducer 简单来说就是一种可组合的、不用生成中间变量的高效方式来达到上面的结果。

相比下面这样每一次的调用都会遍历后生成一个新的中间数组：

```js
array.map(fn1).filter(fn2).reduce(fn3);

// array1 => array2 => result
```

我们更希望的是省略中间的过渡结果，而直接得到最后的结果：

```js
const transformation = compose(map(fn1), filter(fn2), reduce(fn3));

transformation(array);
//array1 => result
```

同时我们也可以在其他地方复用这个 transformation，或者将其与其他的方法组合。

## Power of reduce

通常会组合 map 和 filter：

```js
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => x + 1);
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x % 2 === 0);
// [2, 4, 6, 8, 10]

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  .map((x) => x + 1)
  .filter((x) => x % 2 === 0);
// [2, 4, 6, 8, 10]
```

但其实这两者都可以用 reduce 来实现：

```js
const mapIncReducer = (result, input) => {
  result.push(input + 1);
  return result;
};

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(mapIncReducer, []);
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

其实可以把递加的逻辑抽取出来作为参数传入：

```js
const mapReducer = (f) => (result, input) => {
  result.push(f(input));
  return result;
};

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(mapReducer((x) => x + 1), []);
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

这样可以随意的传入各种各样的逻辑：

```js
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(mapReducer((x) => x - 1), []);
// [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8]

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(mapReducer((x) => x * x), []);
// [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

同样的 filter 也可以用 reduce 来实现：

```js
const filterReducer = (predicate) => (result, input) => {
  if (predicate(input)) {
    result.push(input);
  }
  return result;
};

[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce(filterReducer((x) => x % 2 === 0), []);
// [2, 4, 6, 8, 10]
```

因此我们把一开始的例子改写成这样：

```js
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  .reduce(mapReducer((x) => x + 1), [])
  .reduce(filterReducer((x) => x % 2 === 0), []);
// [2, 4, 6, 8, 10]
```

在这两个 reduce 里我们都使用了 push，实际上加减乘除和 push 等方法都是算作 reducing function，他们接受一个初始值和输入，然后 reduce 成一个单一的结果，如果了解 clojure 这样 lisp 风格的语言，他们的写法其实看上去都差不多：

```clj
(+ 3 4)
;;7

(inc 10)
;; 11
```

我们可以进一步把这些 reducing function 再抽出来：

```js
const mapping = (f) => (reducing) => (result, input) => reducing(result, f(input));

const filtering = (predicate) => (reducing) => (result, input) => predicate(input) ? reducing(result, input) : result;
```

然后像下面这样使用：

```js
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  .reduce(mapping(x => x + 1)((xs, x) => {
    xs.push(x);
    return xs;
  }), [])
  .reduce(filtering(x => x % 2 === 0)((xs, x) => {
    xs.push(x);
    return xs;
  }), []);
// [2, 4, 6, 8, 10]
```

看到这里可能已经有点晕了，不过其实很简单，我们只是延迟执行，传入了两个函数在 reduce 的时候调用而已。reducer 总是符合这样的模式：`result, input -> result`：

```js
mapping(x => x + 1)((xs, x) => {
  xs.push(x);
  return xs;
})([], 1);
// [2]

mapping(x => x + 1)((xs, x) => {
  xs.push(x);
  return xs;
})([2], 2);
// [2, 3]

mapping(x => x + 1)((xs, x) => {
  xs.push(x);
  return xs;
})([2, 3], 3);
// [2, 3, 4]

filtering(x => x % 2 === 0)((xs, x) => {
  xs.push(x);
  return xs;
})([2, 4], 5);
// [2, 4]

filtering(x => x % 2 === 0)((xs, x) => {
  xs.push(x);
  return xs;
})([2, 4], 6);
// [2, 4, 6]
```


我们再回到上面 mapping 和 filtering：

```js
const mapping = (f) => (reducing) => (result, input) => reducing(result, f(input));

const filtering = (predicate) => (reducing) => (result, input) => predicate(input) ? reducing(result, input) : result;
```

我们将其组合一下，也完全符合这种模式！

```js
mapping(x => x + 1)(filtering(x => x % 2 ===0))((xs, x) => {
  xs.push(x);
  return xs;
});
```

因此我们用一个 reduce 就可以完成：

```js
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  .reduce(
    mapping(x => x + 1)(filtering(x => x % 2 === 0)((xs, x) => {
      xs.push(x);
      return xs;
    })),
    []);
// [2, 4, 6, 8, 10]
```

为了更好的可读性，我们用 Ramda 来改写一下：

```js
const xform = R.compose(
  mapping(x => x + 1),
  filtering(x => x % 2 === 0),
);

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  .reduce(xform((xs, x) => {
    xs.push(x);
    return xs;
  }), []);
// [2, 4, 6, 8, 10]
```

最后将其封装到一个 transduce function：

```js
const transduce = (xform, reducing, initial, input) => input.reduce(xform(reducing), initial);
```

就可以随意应用在更复杂的例子中而获得更高的效率：

```js
const square = x => x * x;

const xform = R.compose(
  filtering(x => x % 2 === 0),
  filtering(x => x < 10),
  mapping(square),
  mapping(x => x + 1));

transduce(xform, (xs, x) => {
  xs.push(x);
  return xs;
}, [], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// [1, 5, 17, 37, 65]

transduce(xform, (sum, x) => sum + x, 0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// 30
```


### ref

- [http://elbenshira.com/blog/understanding-transducers/](http://elbenshira.com/blog/understanding-transducers/)

- [http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming](http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming)

- [https://github.com/cognitect-labs/transducers-js](https://github.com/cognitect-labs/transducers-js)

- [https://medium.com/@roman01la/understanding-transducers-in-javascript-3500d3bd9624](https://medium.com/@roman01la/understanding-transducers-in-javascript-3500d3bd9624)