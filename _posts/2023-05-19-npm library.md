---
layout: post
title: 'npm library'
date: 2023-05-19 11:56:23
tags:
  - js
  - npm
description: 'How to distribute your npm library in a good way'
---

2023 年了，在 npm 生态里如果你要写一个 library 并提供良好的 cjs/esm 支持，下面是一些值得注意的事情：

- 首先可以使用 tsup 或者什么别的你喜欢的工具把你的源码编译成这两种格式，其他的什么 umd/iife 就随便你
- 如果你的包提供了多个入口的话还需要配置一下 package.json, 可能涉及到 main/module/exports 这些 property，[可以参见这里](https://nodejs.org/api/packages.html#package-entry-points)
- 你的用户在使用的时候可能会碰上 TypeScript 的报错，[因为 TypeScript Compiler 在 4.7 才开始提供 ESM 的支持](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#ecmascript-module-support-in-nodejs)，他需要把 `module` 或者 `moduleResolution` 设置成 `node16` 或者 `nodenext`
- 如果用户的 TypeScript 版本比较低，或者他不会设置怎么办呢，你可以学习 Next.js 的做法，根目录下写一堆 `entry1.js`, `entry1.d.ts`, 然后里面再指向到你的编译后的产物
