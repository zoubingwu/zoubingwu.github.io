---
layout: post
title: 'npm library'
date: 2023-05-19 11:56:23
tags:
  - js
  - npm
description: 'How to distribute your npm library in a good way'
---

It's 2023, and if you want to write a library in the npm ecosystem with good CommonJS (CJS) and ECMAScript Module (ESM) support, here are some things to consider:

- First, you can use tools like [tsup](https://tsup.egoist.dev/) or any other tool you prefer to compile your source code into these two formats. You can also choose any other formats like UMD or IIFE as well.
- If your package provides multiple entry points, you'll need to configure your package.json accordingly. This may involve setting properties like `main`, `module`, and `exports`. You can refer to the official Node.js documentation on [package entry points](https://nodejs.org/api/packages.html#package-entry-points). Additionally, you can use tools like [publint](https://publint.dev/) and [arethetypeswrong](https://arethetypeswrong.github.io/) to perform checks. There's even a community-created CLI available for [arethetypeswrong](https://github.com/arethetypeswrong/arethetypeswrong.github.io/issues/15).
- Your users may encounter TypeScript errors when using your library because TypeScript Compiler only started providing ESM support starting [from version 4.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#ecmascript-module-support-in-nodejs). They need to set `module` or `moduleResolution` to `node16` or `nodenext`.
- What if your users have a lower TypeScript version or don't know how to configure it? You can learn from the approach taken by [Next.js](https://github.com/vercel/next.js/tree/canary/packages/next). Create a bunch of files like `entry1.js`, `entry1.d.ts` in the root directory and have them point to your compiled artifacts.
