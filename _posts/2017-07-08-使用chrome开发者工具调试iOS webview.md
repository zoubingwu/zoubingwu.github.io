---
layout: post
title: "使用chrome开发者工具调试iOS webview"
date: 2017-07-08 20:15:27
tags:
- chrome
- iOS 
- devtools
description: '对于iOS开发时需要使用的webview调试通常只能使用safari，但是早已习惯了chrome强大的dev tool，该如何是好呢？'
---

## 前言

一般情况下，如果要调试 iOS app中调用webview的表现，需要在 iOS 系统设置中为 Safari 开启 Web 检查器，并用 macOS 上的 Safari 开发者工具调试。但是早已习惯了强大的 Chrome DevTools 的我们，在使用 Safari 的开发者工具时，还是会有很多不习惯。 
因此 Google 利用 Apple 的 [远程 Web 检查器服务](https://developer.apple.com/technologies/safari/developer-tools.html) 制作了可以将 Chrome DevTools 的操作转为 Apple 远程 Web 检查器服务调用的协议和工具：[iOS WebKit Debug Proxy（又称 iwdp）](https://github.com/google/ios-webkit-debug-proxy)。 
下面就来简单介绍一下如何使用这个工具来让我们用 Chrome DevTools 调试 iOS Safari 页面。

## 安装

首先我们通过`homebrew`来安装[ios-webkit-debug-proxy](https://github.com/google/ios-webkit-debug-proxy)，可以通过查看github页面的文档和issues来详细了解使用方法。

```bash
$ brew update
$ brew install libimobiledevice
$ brew install ios-webkit-debug-proxy
```

## 使用

可以使用真机，也可以使用模拟器，但是要注意的是必须先于代理启动。

通过命令行启动模拟器：

```bash
# Xcode changes these paths frequently, so doublecheck them
SDK_DIR="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs"
SIM_APP="/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/Contents/MacOS/Simulator"
$SIM_APP -SimulateApplication $SDK_DIR/iPhoneSimulator8.4.sdk/Applications/MobileSafari.app/MobileSafari
```

如果是真机的话需要在设置 - Safari - 高级中，打开web检查器。

##### 开启代理

用 `-f` 可以选择指定的 DevTools UI 介面，这个介面可以是任意的，这里我们用 Chrome 自带的开发者工具：

```bash
$ ios_webkit_debug_proxy -f chrome-devtools://devtools/bundled/inspector.html
Listing devices on :9221
Connected :9222 to xxxx (xxxxxxxxxxxxxxxxx)
```

打开 [http://localhost:9221/](http://localhost:9221/)，然后点击对应的链接，之后按上头的英文指示复制链接到新tab打开就可以了：

```
Note: Your browser may block1,2 the above links with JavaScript console error:
  Not allowed to load local resource: chrome-devtools://...
To open a link: right-click on the link (control-click on Mac), 'Copy Link Address', and paste it into address bar.
```

**注意：因为 Chrome 不允许打开 chrome-devtools:// 协议的链接，所以不能直接点击链接**

## 错误处理

问题 1：

```bash
$ ios_webkit_debug_proxy
Listing devices on :9221  
Could not connect to lockdownd. Exiting.: Permission deniedConnected :9222 to SIMULATOR (SIMULATOR)  
Invalid message _rpc_reportConnectedDriverList: <dict>  
    <key>WIRDriverDictionaryKey</key>
    <dict>
    </dict>
</dict>  
```

解决方式：

```bash
sudo chmod +x /var/db/lockdown  
```

问题 2：

```bash
$ ios_webkit_debug_proxy
Listing devices on :9221  
Connected :9222 to SIMULATOR (SIMULATOR)  
Invalid message _rpc_reportConnectedDriverList: <dict>  
    <key>WIRDriverDictionaryKey</key>
    <dict>
    </dict>
</dict>  
Disconnected :9222 from SIMULATOR (SIMULATOR)  
send failed: Socket is not connected  
```

解决方式，重装依赖工具：

```bash
$ brew uninstall --force ignore-dependencies -libimobiledevice ios-webkit-debug-proxy
$ brew install libimobiledevice ios-webkit-debug-proxy
```

问题3：

```bash
$ ios_webkit_debug_proxy
Listing devices on :9221  
Connected :9222 to SIMULATOR (SIMULATOR)  
send failed: Socket is not connected  
recv failed: Operation timed out  
```

解决方式，指定 UI 介面：

```bash
$ ios_webkit_debug_proxy -f chrome-devtools://devtools/bundled/inspector.html
```

问题4：

连接 iOS 10 设备可能会出以下报错，无法连接设备：

```bash
$ ios_webkit_debug_proxy -f chrome-devtools://devtools/bundled/inspector.html
Listing devices on :9221  
Could not connect to lockdownd. Exiting.: Broken pipe  
Unable to attach <id> inspector  
```

更新最新的 libimobiledevice 即可：

```bash
$ brew upgrade libimobiledevice --HEAD
```

### ref

- [如何用 Chrome DevTools 调试 iOS Safari](https://sebastianblade.com/debug-ios-safari-with-chrome-devtools/)


- [google/ios-webkit-debug-proxy](https://github.com/google/ios-webkit-debug-proxy)
- [Could not connect to lockdownd. Exiting Permission denied #160](https://github.com/google/ios-webkit-debug-proxy/issues/160)
- [send failed: Socket is not connected #19](https://github.com/google/ios-webkit-debug-proxy/issues/19)
- [could not connect to lockdownd. Exiting.: Permission denied #168](https://github.com/google/ios-webkit-debug-proxy/issues/168)

