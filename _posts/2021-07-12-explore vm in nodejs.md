---
layout: post
title: "explore vm in nodejs"
date: 2021-07-12 12:12:33
tags:
- thoughts
description: "build secure sandbox"
---

It's been a while.

最近看到 [YAPI](https://github.com/YMFE/yapi) 项目因为沙盒执行脚本引起的安全问题。截止目前问题已经修复了，发布了一个 1.9.3 版本，[不过 tag 还打错了](https://github.com/YMFE/yapi/issues/2254)。

去翻了一下代码，是一个典型的沙盒逃逸问题引起的，感觉有点哭笑不得。

切到 v1.9.2 版本，`~/server/middleware/mockServer.js` [有一段执行 mock 脚本的逻辑](https://github.com/YMFE/yapi/blob/ff13353e2fd6e2c37908427dd2e6d287ef8d28ec/server/middleware/mockServer.js#L331)。

```js
let script = project.project_mock_script;
yapi.commons.handleMockScript(script, context);
```

调用了 `~/server/utils/common.js` 中的 `handleMockScript` 函数，然后这个函数调用了 `sandbox` 函数，然后在 node 环境中会使用 `sandboxByNode` 函数来执行脚本，这个函数长这样：

```js
function sandboxByNode(sandbox = {}, script) {
  const vm = require('vm');
  script = new vm.Script(script);
  const context = new vm.createContext(sandbox);
  script.runInContext(context, {
    timeout: 10000
  });
  return sandbox;
}
```

这个漏洞怎么使用呢，很简单，一些 issue 里面也描述的很清楚了，由于 js 语言本身的特性，当你的 context 里暴露了对象或者函数的时候，其实你也把他们的 constructor 暴露出去了，基于原型链的访问，同时也暴露了沙盒本身的 constructor。

```js
const vm = require('vm');
const sandbox = { someNonPrimitive: {} };

vm.createContext(sandbox);
const code = `
  this.someNonPrimitive.constructor.constructor('return process')().env;
`;

console.log(vm.runInContext(code, sandbox).USER) // User name
```

首先得介绍一下 nodejs 中的 `vm` 模块。

官方文档实际上描述的也很清楚了：

> The vm module enables compiling and running code within V8 Virtual Machine contexts. **The vm module is not a security mechanism. Do not use it to run untrusted code.**

它的使用方式非常简单:

```js
const vm = require('vm')
const code = `console.log('hello from the vm')`
vm.runInThisContext(code) // hello from the vm
```

vm 上除了有 `runInThisContext` 方法以外，还有 `runInNewContext`, `runInContext`方法，他们都是什么东西呢？

前端八股文里有一个被问得非常多的概念，那就是 js 中的执行上下文 （`execution context`），`this` 关键字实际上指向了当前代码的执行上下文，其中的坑也非常多。关于它的解释，可以[查看相关的 MDN 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)，我就不当二手贩子了。

回头看看前面的代码，当我们调用了 `console.log` 的时候发生了什么呢？我们从来没有定义过 `console` 这个对象，它实际上是由 runtime 内置的，并且注入到了 global context，因此我们可以在任何地方直接使用它，不需要额外的引入和定义，这个 global context，在浏览器中叫 `window`，在 node 环境中，则叫做 `global`（顺带一提为了解决不同 runtime 下不同名字的问题有一个已经 stage 4 的 `globalThis` 语法），命令行中进入 node 的 repl 环境，然后输入`this === global`，你就能看到它返回了 true，输入 `global.console` 就能看到它返回了 `console` 对象的定义和上面的所有方法。

那么答案就很明显了，`runInThisContext` 就是在当前的上下文中执行代码，因此它自然就可以访问到 `console` 了。

我们知道可以通过 bind，call，apply 这样的方式来修改上下文，类似的，我们也可以显示的设定代码执行的上下文：

```js
const vm = require('vm')
const context = {}
vm.createContext(context)
const code = `console.log('hello world')`
vm.runInContext(code, context)
```

这一次我们指定了上下文为一个空对象作为上下文，再次执行代码，你可以发现什么输出都没有了。

但是还记得我们可以通过 this 关键字来访问上下文对象吗？我们只要简单的修改一下代码，就还是能打印出 hello world：

```js
const context = {}
vm.createContext(context)
const code = `this.constructor.constructor('console.log("hello world")')()`
vm.runInContext(code, context)
```

我们能访问 global context 下的 console，那么意味着也可以访问 process 对象等各种模块，执行任意我们想要执行的代码，而这就违背了我们最初的意愿。

但业务上，我们有时候会确实存在执行一些外部输入的动态脚本的需求，典型的像 leetcode 的场景，或者一些用户自定义插件，让用户在可控的范围内，去扩展更多的能力，来满足更多的需求。

如果只是单纯的执行动态脚本，我们有非常多的选择，比如臭名昭著的 `eval`，或者 `Function`。

```js
eval('1 + 1') // 2

const sum = new Function('m', 'n', 'return m + n');
sum(1, 1) // 2
```

或者我们可以创建一个 iframe 或者 worker，让代码在单独的环境中运行。

同单纯客户端的应用不同，如果在服务端需要有这样的能力，就需要考虑非常多的安全问题，外部输入的脚本必须收到严格的限制和隔离，不能影响到宿主程序，更不能影响到其他用户。

社区基于 vm 模块也给出了很多的解决方案，其中做的比较好的，就是 [`vm2`](https://www.npmjs.com/package/vm2) 了。

```js
const { VM } = require('vm2');
const vm = new VM();

vm.run(`process.exit()`); // TypeError: process.exit is not a function
```

`vm2` 会使用 `proxy` 作为防御，阻止所有对 `constructor` 和 `__proto__` 等属性的访问，同时通过白名单机制来限制对 node 内置模块的访问。

当然，并不是使用了 `vm2` 就可以高枕无忧了，我们还需要考虑很多其他的可能性。假如：

1. 假如我们编写的沙盒代码有 bug 怎么办？
2. 假如我们白名单的模块中包含危险的依赖暴露出去了怎么办？
3. 假如 `vm2` 本身有 bug 怎么办？它也确实出过 bug
4. 假如 node 本身有问题怎么办？
5. 假如 node 的一些相关依赖有问题怎么办？

目前还没有完美的解决方案，这个世界不存在绝对安全，只存在相对安全，我们可以采取一些措施，来尽可能的减少可能存在的风险。

比如将 `vm2` 和相关的沙盒逻辑隔离在独立的进程中运行，将程序运行在 docker 这样的环境中而不是直接在宿主机器上运行，针对沙盒进程进行 CPU 内存的的配额限制，限制文件读写的能力等等。

例如 Google 推出了 [gVisor](https://github.com/google/gvisor) 来尝试解决这些问题。

> Containers are not a sandbox. While containers have revolutionized how we develop, package, and deploy applications, using them to run untrusted or potentially malicious code without additional isolation is not a good idea. While using a single, shared kernel allows for efficiency and performance gains, it also means that container escape is possible with a single vulnerability.

ref:

- [https://nodejs.org/api/vm.html](https://nodejs.org/api/vm.html)
- [https://medium.com/@devnullnor/a-secure-node-sandbox-f23b9fc9f2b0](https://medium.com/@devnullnor/a-secure-node-sandbox-f23b9fc9f2b0)
- [https://github.com/google/gvisor](https://github.com/google/gvisor)
- [https://github.com/Houfeng/safeify/blob/master/DOC.md](https://github.com/Houfeng/safeify/blob/master/DOC.md)
- [https://github.com/YMFE/yapi/issues/2099](https://github.com/YMFE/yapi/issues/2099)
