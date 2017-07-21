---
layout: post
title: "详解正则表达式中的capture group"
date: 2017-07-16 14:53:27
tags:
- regular expression
description: '说说如何利用正则表达式中的capture group来匹配重复项和进行特定的替换'
---

## 前言

正则表达式这个东西属于熟能生巧，并没有什么特别难以理解的地方，这里推荐一个关于正则的[网站](http://regexr.com/)，提供了各种例子和cheatsheet，也可以很方便帮助理解开源项目源码中的各种正则。

这篇博文我们关于基本的正则匹配就不赘述了，主要说说其中的`capture group`。

### capture group

举个例子，我们需要检测一个字符串中是否有重复的字母：

```javascript
/([a-zA-Z])\1/.test(str)
```

这利用括号包起来的一组，就是一个`capture group`，而之后的`\1`就是这第一个`capture group`的引用，如果有多组括号的话，后续的引用也就是`\2`,`\3`等。在`replace`等方法中，这个写法又稍微有区别了。

比如我们需要把一个http url替换为html中的a标签形式：

```javascript
var str = 'you can click on https://google.com to visit google.com'

str = str.replace(/(https?:\/\/\S+?)/, '<a href="$1">$1</a>')
// you can click on <a href="https://google.com">https://google.com</a> to visit google.com
```

在这里就是使用的\$1， \$2等来表示捕获组的引用，如果replace方法中的第二个参数是一个函数的话，它们也将作为第二个参数起传入该函数。

### non-capturing group

那么有的时候我们单纯需要匹配一个已知的重复单词，而又不需要去记录它的引用呢？看看这个例子：

```javascript
/foo{3,}/
```

其实我们是想匹配重复三次以上的单词`foo`，但是又不需要去记录它的引用，而上面的正则中的3次以上只会去匹配字母o，这个时候我们也可以使用括号，但稍微有些不同：

```javascript
/(?:foo){3,}/
```

### lookahead

括号还有两种用法，叫做`lookahead`，还是举例子，我们需要匹配字符串中的`president mao`或者是`president jiang`：

```javascript
/president\s(?=jiang|mao)/
```

`x(?=y)`这种形式就是仅仅匹配x后面跟着y，这叫做正向肯定查找(positive lookahead)，有正向就有反向，对于仅匹配x后面不跟着y的，它的形式就是`x(?!y)`这样的(negative lookahead)。

### 总结

熟练使用`capture group`和`lookahead`在一些字符串的替换和查找中是非常方便的，当然本文对此的介绍也是比较简单的，只有经常练习和使用才能更好的掌握这些用法。

#### ref

- [https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)
- [http://regexr.com/](http://regexr.com/)