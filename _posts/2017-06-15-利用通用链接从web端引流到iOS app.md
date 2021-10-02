---
layout: post
title: "利用通用链接从web端引流到iOS app"
image: ''
date: 2017-06-15 10:15:27
tags:
- iOS
description: '在web端通过url scheme和universal link来呼出iOS app或跳转到app store，实现对app的引流。'
---

经常会有在app上线后，web端需要添加将用户引导到app的入口，这里只说说iOS端的处理，其实安卓的话区别也不大。

#### 入口

通常从web端引流到app有两处入口，一个是浏览器顶部的banner：

![smartbanner](/assets/images/2017-06-15-利用通用链接从web端引流到iOS app/smartbanner_2x.png)

一个是底部可以随滚动控制显示和隐藏的悬浮按钮。

关于顶部的banner，一个是将iOS开发人员编写的通用链接的`apple-app-site-association`文件置于服务器的根目录（同网页端的文件），另一种就是在head内加入meta标签：

```html
<meta name="apple-itunes-app" content="app-id=myAppStoreID, affiliate-data=myAffiliateData, app-argument=myURL">
```

相关的内容可以参考苹果的[官方文档](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariWebContent/PromotingAppswithAppBanners/PromotingAppswithAppBanners.html)。

#### 逻辑和代码

在点击这两个入口的时候需要判断两种情况：

1. 如果用户安装了app，则跳转到app内相对应的页面。
2. 如果用户没有安装app，则跳转到app store对应的下载页面。

顶部的banner由于是苹果系统所提供的，可以自动判断，就不再赘述。

仅通过浏览器并没有API去判断用户是否安装了app，所以在这里引入两个概念，一个是`URL Scheme`，一个是通用链接`Universal Link`。，由于是iOS开发的内容，所以关于这两者的具体使用和配置可以查看相关的文档，不在这里详细解释了。

`URL Scheme`简单来说，类似我们web端熟悉的通常使用`http`或`https`协议的URL，比如：

```xml
首页：https://www.apple.com
子页面：https://www.apple.com/mac
```

而`URL Scheme`可以理解为使用了应用特有的协议，它们长的类似这样：

```xml
应用首页：weixin://
子页面： weixin://di/moments (朋友圈)
```

在app端进行了相关的配置以后，网页端通过`user agent`来检测到iOS环境下时，可以直接设置：

```javascript
window.location.href = url
```

此时如果安装了应用，就会直接跳转到app，否则会弹框提醒无法识别这个链接，因此此处的体验不是特别好。

而通用链接其实就是一条https链接，app内配置后使用时如果安装了app则会直接跳转到app，否则会当成普通的网页链接跳转，注意需要配置https，并且使用时需要和当前页面异域。

因此我们可以将这条链接制作为一个中转的欢迎页面，比如通用链接为`https://ios.xxx.com`，在`https://xxx.com`下的悬浮按钮上绑定点击事件，点击后直接设置`location.href`为`https://ios.xxx.com`，那么安装了app就可以直接跳转到app，否则跳转到中转页面，在中转页面我们可以在载入后马上设置`location.href`为iTunes的链接，那么用户进入中转页面后马上会提示是否跳转到iTunes的对应app下载链接。同样的，通过在链接中带上参数就可以确保跳转到对应的子页面。

由于通用链接仅支持iOS9以上的用户，因此对于iOS9以下的用户我们还是只能使用`URL Scheme`，下面是代码：

```javascript
function openInApp() {
  // iOS9以上直接使用通用链接
  if (version >= 9) {
    window.location.href = 'https://ios.xxx.com?parameter=xxxx'
    return;
  }

  //iOS9以下，使用URL Scheme
  window.location.href = 'app://xxxxxxxx'

  // 设置一个计时器，若安装了app则上一步就成功跳转，以下代码不会执行，
  // 若未安装则无法识别上一个抛出的链接，我们则继续抛出app在iTune的下载地址
  var loadDateTime = Date.now()
  setTimeout(function() {
    var timeOutDateTime = Date.now()
    if (timeOutDateTime - loadDateTime < 1000) {
      window.location.href = "https://itunes.apple.com/xxxxxxxxxx";
    }
  }, 25);
}
```

最后值得注意的是，使用通用链接跳转到app后，iOS在左上角提供了一个返回到浏览器的点击链接，也会在右上角提供一个使用浏览器打开通用链接的入口，点击后会在浏览器创建一个新的窗口来打开通用链接，意味着打开了我们为未安装app的用户准备的中转页面。并且这个使用习惯会被系统记录，一旦使用了一次，则以后每次点击通用链接都会使用浏览器来打开而无视是否安装了app，除非再次手动使用app打开来改变这个纪录。