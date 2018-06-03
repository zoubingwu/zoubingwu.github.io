---
layout: post
title: "Build a mini module bundler"
date: 2018-06-03 11:29:31
tags:
- webpack
description: "Understand how module bundler works by building a simple one."
---

## Introduction

> Module bundlers compile small pieces of code into something larger and more complex that can run in a web browser. These small pieces are just JavaScript files, and dependencies between them are expressed by a module system.

模块化编程使得开发者可以将一个大型的程序拆分成多个小的模块，由每一个模块提供可靠的抽象和封装，确保每一个模块正常工作，再拼装起来，这一思想使得多人协作参与的大型程序开发更可控，对 debug 和测试等更友好。

Node.js 自诞生就开始支持模块化的，但浏览器的世界里这个过程依然处于缓慢的发展之中。Webpack 这类工具的诞生也是为了解决这个问题，使得我们可以不用顾虑全局变量之类的各种问题编写各种模块，最后再打包成一个文件。

我们可以自己尝试编写一个简单的打包工具来理解其中的原理。

## How

首先从入口文件开始，分析其依赖，然后不断获取依赖的依赖，最后生成一个依赖树。当然为了简单，我们先不考虑循环依赖，各种模块类型，缓存模块等等。

我们直接使用 babel 提供的 babylon 等相关的编译工具来分析文件，可以编写一个函数来分析依赖：

```js
const fs = require('fs');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const { transformFromAst } = require('babel-core');

// 使用一个递增的 id 来区分每一个依赖
let ID = 0;

function createAsset(filename) {
  // 获取入口文件的文本内容
  const content = fs.readFileSync(filename, 'utf-8');

  // 利用 babylon parser 从 ES6 代码生成 ast
  const ast = babylon.parse(content, {
    sourceType: 'module',
  });

  const dependencies = [];

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    },
  });

  // 这里我们使用 babel 提供的工具从 ast 转化为 ES5 代码以适应多种浏览器
  const { code } = transformFromAst(ast, null, {
    presets: ['env'],
  });

  const id = ID++;

  return {
    id,
    filename,
    dependencies,
    code,
  };
}
```

利用上面这个函数我们可以抽取一个模块的依赖，接下来要做的，就是从入口文件开始，不断去获取依赖，依赖的依赖...最后搞清楚所有的依赖，以及谁依赖谁的关系，生成一个 dependency graph。

```js
const path = require('path');

function createGraph(entry) {
  const mainAsset = createAsset(entry);

  // 我们用一个数组来保存每一个文件的依赖关系。一开始这里只有入口文件。
  const queue = [mainAsset];

  // 循环这个数组，分析其依赖，并将相对路径转换为绝对路径，然后在 push 到该数组内。
  for (const asset of queue) {
    asset.mapping = {};

    // 模块当前所在的文件内
    const dirname = path.dirname(asset.filename);

    asset.dependencies.forEach(relativePath => {
      const absolutePath = path.join(dirname, relativePath);
      const child = createAsset(absolutePath);

      // 保存这个依赖关系
      asset.mapping[relativePath] = child.id;

      queue.push(child);
    });
  }

  return queue;
}
```

第三个函数，我们就利用上面的 dependency graph 来生成一个 bundle，相当于 webpack 最后打包出来的一个 bundle.js：

```js
function bundle(graph) {
  let modules = '';

  /**
   * 生成一串 key-value 结构，以 id 作为 key，一个数组作为 value。
   * 其中数组的第一个值为一个函数包裹的代码块，这样各自模块的作用域保持独立，不会影响其他的模块。
   * 第二个值为 { './relative/path': 1 } 这样的 mapping 对象，
   * 方便模块内使用相对路径的 require 函数调用。
   *
   * 因为生成的代码使用了 CommonJS 的模块引入方式，因此我们之后需要手动实现一下 require 函数。
   */
  graph.forEach(singleModule => {
    modules += `${singleModule.id}: [ function (require, module, exports) { ${singleModule.code} }, ${JSON.stringify(singleModule.mapping)}, ],`;
  });

  // 将 require 函数和 module.exports 保存在匿名的 IIFE 主函数，并将其引用注入到模块内部。
  const result = `(function(modules) {
    function require(id) {
      var fn = modules[id][0];
      var mapping = modules[id][1];

      function localRequire(name) {
        return require(mapping[name]);
      }

      var module = { exports: {} };

      fn(localRequire, module, module.exports);

      return module.exports;
    }

    require(0);
  })({ ${modules} });`


  fs.writeFile('bundle.js', result, 'utf-8', (err) => {
    if (err) throw err;
    console.log('The bundle file has been saved!');
  });

  return result;
}
```

最后我们可以写一个简单的 entry file 来测试一下，生成 graph 并调用 bundle 就可以完成打包了！代码可以查看[https://github.com/shadeofgod/build-a-simple-module-bundler](https://github.com/shadeofgod/build-a-simple-module-bundler)。

### ref

- [https://webpack.js.org/concepts/modules/](https://webpack.js.org/concepts/modules/)
- [https://github.com/ronami/minipack](https://github.com/ronami/minipack)
