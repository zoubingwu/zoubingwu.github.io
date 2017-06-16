---
layout: post
title: "javascript简单实现跨浏览器复制粘贴"
image: ''
date:   2017-03-31 21:46:18
tags:
- javascript
description: ''
categories:
- javascript
serie: learn
---

最近写一个小功能，需要点击按钮来把内容复制到剪贴板，虽然有不少插件可以很轻易的实现，不过其实用短短的几行原生js就足够了，代码不需要任何的依赖。

首先要了解的是`clipboard`的相关api，由于这个标准一直在草稿阶段，加上浏览器对权限的限制不一，因此兼容性并不是很好。

文档可以看这里：[https://w3c.github.io/clipboard-apis/#widl-ClipboardEvent-clipboardData](https://w3c.github.io/clipboard-apis/#widl-ClipboardEvent-clipboardData)

具体的浏览器支持和详细的细节可以看这里：[http://caniuse.com/#search=clipboard](http://caniuse.com/#search=clipboard)

在IE中可以通过getData和setData两个方法就可以实现复制和粘贴了：

```javascript
function copy() {
  if (window.clipboardData) {
 	window.clipBoard.setData('Text', target.innerHTML)
  }
}

function paste(target) {
  if (window.clipboardData) {
    target.innerText = window.clipboardData.getData('Text');
    return;
  }
}
```

有一个更好的方法，是使用`document.execCommand(‘copy’) `来执行复制操作，当然首先你需要先手动来选中需要复制的文本：

```javascript
function copy(target){
  target.select();
  document.execCommand('copy');
}
```

对于chrome和火狐，因为上面的copy操作必须针对于可修改的目标，因此我们可以稍作修改：

```javascript
function copy(target) {
  var textArea = document.createElement('textarea');
  // 由于火狐需要目标必须可见，因此我们可以设置透明度为0
  textArea.setAttribute('style','width:1px;border:0;opacity:0;');
  document.body.appendChild(textArea);
  textArea.value = target.innerHTML;
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}
```

