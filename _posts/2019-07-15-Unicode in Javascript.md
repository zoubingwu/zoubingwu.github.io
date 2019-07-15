---
layout: post
title: "Unicode in Javascript"
date: 2019-07-15 17:13:31
tags:
- unicode
- javascript
description: "Explain how to work with Unicode in JavaScript."
---

# What is unicode

本质上计算机只处理数字，为了处理字符，最初制定了一套 ASCII 编码，对英文字符和数字做了统一规定。一共有 128 个字符编码，例如大写的字母 A 是 65（二进制 01000001）。

但考虑到数百种语言成千上万的不同字符，一个字节八位，最多只能表示 256 种符号，是远远不够的，因此后来发展出许多不同的编码方式来解决这个问题，打开一个文本文件，就必须知道它的编码方式，否则用错误的编码方式解读，就会出现乱码。尤其随着互联网的普及，一个统一的编码成为了一个非常广泛的需求，人们需要有一种编码，将世界上所有的符号都纳入其中，每一个符号都给予一个独一无二的编码，从而解决乱码问题，这就是 Unicode。

> Unicode provides a unique number for every character,
> no matter what the platform,
> no matter what the program,
> no matter what the language.

# Encoding of source files

在 web 环境中，一个文件的编码方式是如何确定的呢？

如果没有设置过，会按照 local 的字符集。

可以通过 [BOM](https://en.wikipedia.org/wiki/Byte_order_mark) 来设置，不过现在主流的编辑器都不会在文件头添加 BOM 了。

Unicode standard:

> … Use of a BOM is neither required nor recommended for UTF-8, but may be encountered in contexts where UTF-8 data is converted from other encoding forms that use a BOM or where the BOM is used as a UTF-8 signature.

W3C says:

> In HTML5 browsers are required to recognize the UTF-8 BOM and use it to detect the encoding of the page, and recent versions of major browsers handle the BOM as expected when used for UTF-8 encoded pages. – [https://www.w3.org/International/questions/qa-byte-order-mark](https://www.w3.org/International/questions/qa-byte-order-mark)

如果文件通过 HTTP 协议获取，`Content-Type` 头可以设置编码方式：

```
Content-Type: application/javascript; charset=utf-8
```

如果没有在 HTTP 头部中设置，会检查 `script` tag 的 charset 属性：

```html
<script src="./app.js" charset="utf-8">
```

如果也没有设置的话，会检查 document charset meta tag

```html
<head>
  <meta charset="utf-8">
</head>
```

# Inside Javascript

不管 Javascript 文件的编码是什么，Javascript 内部都会在执行之前转换为 UTF-16，as the ECMAScript standard says:

> When a String contains actual textual data, each element is considered to be a single UTF-16 code unit.

# Unicode in a string

Unicode 可以通过 `\uXXXX` 的格式来作为字符串使用

```js
const s1 = '\u00E9' // é
```

也可以通过组合两个 unicode 字符来表示：

```js
const s2 = '\u0065\u0301' // é
```

注意这两个字符看上去相同，但其实是不同的：

```js
s1 === s2 // false
s1.length // 1
s2.length // 2
```

也可以通过组合一个普通字符和 unicode 字符：

```js
const s3 = 'e\u0301' // é
s3.length === 2 // true
s2 === s3 // true
s1 !== s3 // true
```

可以通过 unicode 来检查中文字符，具体可以查看 [http://www.unicode.org/reports/tr38/#BlockListing](http://www.unicode.org/reports/tr38/#BlockListing)：

```js
/[\u4E00-\u9FCC]/ // CJK Unified Ideographs
/[\u3400-\u4DB5]/ // CJK Unified Ideographs Extension A
/[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6]/ // CJK Unified Ideographs Extension B
/\ud869[\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34]/ // CJK Unified Ideographs Extension C
/\ud86d[\udf40-\udfff]|\ud86e[\udc00-\udc1d]/ // CJK Unified Ideographs Extension D
```

当搜索中文信息时你会发现大部分正则都是用的第一个。

## Normalize

为了解决上面这种看上去相同实际上是不同组合的问题，ES2015 提供了一个 normalize 的 API

```js
s1.normalize() === s2.normalize() //true
```

## Convert

十进制和十六进制

```js
0x4e00 // decimal: 19968
parseInt('4e00', 16) // 19968, hexdecimal -> decimal
(19968).toString(16) // '4e00', decimal -> hexdecimal
```

字符和数字转换

```js
String.fromCodePoint(19968)
String.fromCodePoint(0x4e00) // 汉字 `一`

'一'.codePointAt(0) // 19968
```

## Emojis

Emojis 实际上也是 unicode 字符，因此可以在字符串中使用，具体可以查看 [https://unicode.org/emoji/charts/full-emoji-list.html](https://unicode.org/emoji/charts/full-emoji-list.html)

```js
const s4 = '🐶'
```

# ref

- [https://unicode.org/standard/WhatIsUnicode.html](https://unicode.org/standard/WhatIsUnicode.html)
- [http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html](http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html)
- [https://en.wikipedia.org/wiki/Byte_order_mark](https://en.wikipedia.org/wiki/Byte_order_mark)
- [https://stackoverflow.com/questions/21109011/javascript-unicode-string-chinese-character-but-no-punctuation](https://stackoverflow.com/questions/21109011/javascript-unicode-string-chinese-character-but-no-punctuation)
- [https://tools.ietf.org/html/rfc4329](https://tools.ietf.org/html/rfc4329)