---
layout: post
title: "Program lifecycle"
date: 2018-02-13 22:33:21
tags:
- cs
description: "Program lifecycle phases are the stages a computer program undergoes, from initial creation to deployment and execution."
---

## Edit time or design time

即程序源码被创造的阶段，包括了加入新的 feature，代码重构，bug 修复等，同样也不仅是人工编写的代码，也包含了一些工具生成的代码。

## Compile time

即源码被编译器编译为机器码的阶段，包括了语法检查，类型检查等等，最后生成一个执行文件。当然像 js 等很多解释型的语言可能会把这一阶段放在 run time 来做。

## Link time

开发时经常会有很多代码模块，包括使用了一些外部的代码，这个时候就需要把它们连接起来，一般分为静态链接和动态链接。像 ES6 的 import 语句目前就还支持静态引入。

## Distribution time

分发阶段，就是把程序分发给用户了。通常来说都是提供执行文件，也有直接提供源码。

## Installation time

由操作系统将执行文件安装于机器上以便之后的调用。

## Load time

操作系统将执行文件加载到内存以开始执行的阶段。

## Run time

就是运行时了，虽然这个翻译看上去不是很好。这个阶段就是 cpu 执行程序的机器码指令了。像 Nodejs 的介绍就是:

> a JavaScript **runtime** built on Chrome's V8 JavaScript engine.
