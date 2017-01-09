---
layout: post
title: "使用css打造自定义firefox界面"
image: ''
date:   2017-01-09 17:03:18
tags:
- firefox customize
description: ''
categories:
- Css
serie: learn
---

一直以来都觉得safari、chrome、firefox三款浏览器都各有各的优点，但是又都有那么点儿不尽如人意的地方，比如firefox的标签页顶端总是留出来一截空白，让我这个强迫症真是万分难受。

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1483953337/blog/Screen_Shot_2017-01-09_at_17.09.37.png" />

不过firefox一直都是以定制化能力强而闻名，所以稍微搜索了一下解决方案，发现可以用stylish插件来直接通过css语法修改UI界面。简单搜了下中文资料有很多现成的代码，但是似乎大都没有讲具体的方法，这里就和大家简单分享一下该如何去操作。

1. 首先，安装stylish插件。


2. 然后，点开一个标签页，地址栏中输入：`chrome://browser/content/browser.xul`，这样会打开一个包含火狐浏览器UI元素的页面。

   （注：我也看到不少人是直接通过firefox配置文件中的userChrome.css来修改的，不过我的mac上找不到这么一个文件，而且通过stylish可以更方便的管理多种样式表，所以如果不太懂这些东西的朋友我个人建议还是不要去修改源文件。）

3. 直接在这个页面打开开发者工具，使用查看器就可以查看到你想修改的元素的id或者class名。


4. 接下来就可以通过stylish新建一个样式表，修改对应id或者class的css属性就可以了。

比如我只是新建了一个叫firefox UI的样式表，加入代码：

```css
.tabbrowser-arrowscrollbox {
  margin-top: -8px;
}
```

就解决了标签页顶端空出一小截的问题：

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1483953901/blog/Screen_Shot_2017-01-09_at_17.24.40.png" />

最后总结，只要你稍微懂一点点css的语法，搭配firefox本身的定制功能，就可以打造自己专属的UI界面了，当然也可以直接去下载其他人提供的样式表或者各种插件。需要提醒的是，stylish也不仅仅是修改UI，你还可以修改对应网页的css样式，更多的功能可以进入stylish的官网自行查看。