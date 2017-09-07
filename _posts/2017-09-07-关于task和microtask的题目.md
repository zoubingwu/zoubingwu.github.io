---
layout: post
title: "关于task和microtask的题目"
date: 2017-09-07 09:02:03
tags:
- javascript
description: "继续上一篇的内容，来个相关的题目练练手..."
---

先来 html 结构如下：

```html
<div class="outer">
  <div class="inner"></div>
</div>
```

JS代码如下，点击 `div.inner` 的时候会有什么样的结果呢？

注：关于 MutationObserver API 可以查看 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)

```js
// Let's get hold of those elements
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

// Let's listen for attribute changes on the
// outer element
new MutationObserver(function() {
  console.log('mutate');
}).observe(outer, {
  attributes: true
});

// Here's a click listener…
function onClick() {
  var name = this.className;

  console.log(name + ' is clicked');

  setTimeout(function() {
    console.log('timeout from ' + name);
  }, 0);

  Promise.resolve().then(function() {
    console.log('promise from ' + name);
  });

  outer.setAttribute('data-random', Math.random());
}

// …which we'll attach to both elements
inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);

```

其实明白了上一篇文章，答案是很简单的，下面是我自己测试的结果：


- 首先是 chrome Version 60.0.3112.113 (Official Build) (64-bit)

![]({{site.url}}/assets/images/2017-09-07/chrome.png)

- safari Version 10.1.2 (12603.3.8)

![]({{site.url}}/assets/images/2017-09-07/safari.png)

- But... in firefox 53.0.3 (64 位)

![]({{site.url}}/assets/images/2017-09-07/firefox.png)

我们来一步一步具体分析一下：

1. 点击 inner;
2. 由于默认不使用捕获，所以先触发 inner 的 onClick 回调函数;
3. 打印 inner is clicked;
4. setTimeout 将新的 task 放入队列;
5. promise 会将新的 microtask 放入队列;
6. 给 outer 设置属性，触发 MutationObserver;
7. MutationObserver 将新的 microtask 放入队列;
8. 回调函数中的内容结束，查看有无 microtask;
9. 执行 5 中的内容，打印 promise from inner;
10. 执行 7 中的内容，打印 mutate;
11. inner 的点击事件回调函数整个 task 结束，事件继续向上冒泡;
12. 触发 outer 的 onClick 回调函数;
13. 打印 outer is clicked;
14. setTimeout 将新的 task 放入队列;
15. promise 将新的 microtask 放入队列;
16. 给 outer 再次设置属性，触发 MutationObserver;
17. MutationObserver 将新的 microtask 放入队列;
18. 回调函数中的内容结束，查看有无 microtask;
19. 执行 15 中的内容，打印 promise from outer;
20. 执行 17 中的内容，打印 mutate;
21. outer 的点击事件回调函数整个 task 结束;
22. 继续下一个 task，即 4 中的内容，打印 timeout from inner;
22. 继续下一个 task，即 14 中的内容，打印 timeout from outer;
23. 终于，全部结束。

从这个过程我们可以看出来，microtask 如果是在回调函数中被加入的，那么执行会在回调函数的完成后马上执行，并非局限在 task 的末尾，这也是根据[ html 文档](https://html.spec.whatwg.org/multipage/webappapis.html#calling-scripts:perform-a-microtask-checkpoint)来做出的分析。

> The steps to clean up after running script with an environment settings object settings are as follows:
> - Assert: settings's realm execution context is the running JavaScript execution context.
> - Remove settings's realm execution context from the JavaScript execution context stack.
> - **If the JavaScript execution context stack is now empty, perform a microtask checkpoint.** (If this runs scripts, these algorithms will be invoked reentrantly.)

因此 chrome 和 safari 的结果都是符合文档的标准的，而 firefox 会将 microtask 放到 task 的末尾才开始执行，这个问题你可以在这个 [ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=1193394) 里面看看大家的讨论。

现在我们换一种方式来触发，我们在 JS 代码中最后加上一句：

```js
inner. click();
```

结果会是什么呢？

我们来再一次来一步一步分析：

1. inner 点击事件触发;
2. 触发 inner 的 onClick 回调函数;
3. 打印 inner is clicked;
4. setTimeout 将新的 task 放入队列;
5. promise 会将新的 microtask 放入队列;
6. 给 outer 设置属性，触发 MutationObserver;
7. MutationObserver 将新的 microtask 放入队列;
8. 回调函数中的内容结束，但是！我们回头看看文档中的前提条件：**If the JavaScript execution context stack is now empty**，这个时候满足吗？并不，`.click()` 实际上和冒泡不同，会同步触发上级元素上的点击事件，因此此时 execution context stack 并不是空的，而是还需要继续执行 outer 的点击事件;
9. 触发 outer 的 onClick 回调函数;
10. 打印 outer is clicked;
11. setTimeout 将新的 task 放入队列;
12. promise 将新的 microtask 放入队列;
13. 给 outer 再次设置属性，但此时第 7 步的 microtask 还在队列中未执行，因此不会再次将这个 microtask 放入队列;
14. 回调函数中的内容结束;
15. 开始执行 microtask;
16. 执行 5 中的内容，打印 promise from inner;
17. 执行 7 中的内容，打印 mutate;
18. 继续下一个 task，即 4 中的内容，打印 timeout from inner;
19. 继续下一个 task，即 14 中的内容，打印 timeout from outer;
20. 终于，全部结束。

因此正确的结果因该是: `inner is clicked`, `outer is clicked`, `promise from inner`, `mutate`, `promise from outer`, `timeout from inner`, `timeout from outer`。

### 总结

- task 会按顺序进行，浏览器可能在 task 之间来渲染

- microtask 也按照顺序进行，并且：
  - 要么在每一个回调函数末尾开始执行；
  - 要么在每个 task 的末尾开始执行。

