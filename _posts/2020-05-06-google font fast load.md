---
layout: post
title: "google font fast load"
date: 2020-05-06 18:28:44
tags:
  - browser
  - performance
description: "解决 google font 在国内加载速度的问题"
---

最近换了个更舒服的中文字体，但由于众所周知的原因，google font 的加载速度在国内一直比较慢，博客里直接引用相关的资源可能导致加载速度不理想。随手搜了一下相关镜像发现都是好几年的了，有些也不再维护了。

其实对于 Github 开源的博客来说有很多相关的工具可以直接使用，思路非常简单：字体相关资源直接保存到 Github repo，通过 jsdelivr CDN 服务来访问相关资源。

jsdelivr 可以通过构造下面这样的路径来访问 Github 仓库的资源，而且在国内的速度还不错：`https://cdn.jsdelivr.net/gh/<用户名>/<仓库名>@<分支名>/<文件路径>`，另外对于图片之类的资源也可以使用这种方式。

由于 google font 是通过一个 css 去引用其他的 gstatic 域名上的相关字体文件，可能涉及到非常多的文件和路径的替换，这里可以直接使用一个 [get-google-fonts](https://www.npmjs.com/package/get-google-fonts) 的包来完成下载和引用路径的替换：

```sh
npx get-google-fonts -i https://fonts.googleapis.com/css\?family\=Noto+Serif+SC\&display\=swap -p https://cdn.jsdelivr.net/gh/shadeofgod/shadeofgod.github.io@master/fonts/ -c googlefont.css
```

然后把相关引用的资源替换成 `https://cdn.jsdelivr.net/gh/shadeofgod/shadeofgod.github.io@master/fonts/googlefont.css` 就可以了

另外字体文件通常比较大，有些浏览器下载完成之前可能会先隐藏文字的显示，这样会导致 [a flash of invisible text (FOIT)](https://web.dev/avoid-invisible-text)。可以通过设置 `font-display: swap` 来先显示默认字体，完成下载后再替换，实际上 google font 本身就提供了这种设置，直接在 google font URL 的末尾添加一个 `&display=swap` 的参数就可以了。

### reference

- [https://www.jsdelivr.com/features](https://www.jsdelivr.com/features)
- [https://www.npmjs.com/package/get-google-fonts](https://www.npmjs.com/package/get-google-fonts)
- [https://web.dev/font-display/](https://web.dev/font-display/)
- [https://web.dev/avoid-invisible-text](https://web.dev/avoid-invisible-text)
