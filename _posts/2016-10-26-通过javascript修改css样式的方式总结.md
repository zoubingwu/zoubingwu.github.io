---
layout: post
title: 通过javascript修改css样式的常用方式总结
image: ''
date:   2016-10-26 00:48:21
tags:
- Javascript
description: ''
categories:
-Javascript
serie: learn

---





- 通过dom element对象的`getAttribute()`、`setAttribute()`、`removeAttribute()`方法修改style属性。
  - `element.getAttribute()`
  - `element.getAttributeNode()`
  - `element.setAttribute()`
  - `element.setAttributeNode()`
  - `element.removeAttribute()`
  - `element.removeAttributeNode()`

比如：

```javascript
var div = document.getElementById("div1");
div.setAttribute("style", "color:red;height:200px;");
```

------



- 通过对元素节点的style对象，来读写行内css样式。

  比如：

```javascript
var div = document.getElementById("div1");
div.style.height = "100px";
div.style.color = "red";
div.style.fontSize = "20px";
```

注意css属性在有小横杠的时候要改用驼峰命名，比如`background-color`应改为`backgroundColor`，在遇到js保留字的时候要添加css，比如`float`改为`cssFloat`。另外所有的值都是字符串，所以必须添加单位，比如高度不能设置为`100`，而是必须带上单位写为`100px`。

------



- 通过style对象的`cssText`属性来修改全部的style属性。

```javascript
<span id="s1" style="color: red;font-size: 20px;">
Some text
</span>

<script>
  var elem = document.getElementById("s1");
  alert(elem.style.cssText); // { color: red; font-size: 20px;}
</script>
```

------

- 通过style对象的setProperty()，getPropertyValue()，removeProperty()方法来读写行内css样式。

> setProperty(propertyName,value)：设置某个CSS属性。
> getPropertyValue(propertyName)：读取某个CSS属性。
> removeProperty(propertyName)：删除某个CSS属性。

这里的属性名字都不需要改写连词的横杠。

```javascript
var div = document.getElementById('div1');

div.style.setProperty('background-color','red');
div.style.getPropertyValue('background-color');
div.style.removeProperty('background-color');
```

------

- 通过`window.getComputedStyle()`方法获得浏览器最终计算出来的样式规则。

因为网页元素最终的样式是综合多种规则计算出来的，而不仅仅是行内样式，通过这个方法就可以返回这个规则。

```javascript
var div = document.querySelector('div');
window.getComputedStyle(div).backgroundColor
```

可以通过第二个参数来选择指定节点的伪元素：

```javascript
var result = window.getComputedStyle(div, ':before');
```

另比如如何获取元素的高度：

```javascript
var elem = document.getElementById('elem-container');
var hValue = window.getComputedStyle(elem, null)
  .getPropertyValue('height');
```

注意这个得到的height属性是浏览器最终渲染出来的高度。

该方法有几点需要注意：

> - 计算出来的CSS都是绝对单位，比如长度都是像素单位（返回值包括`px`后缀），颜色是`rgb(#, #, #)`或`rgba(#, #, #, #)`格式。
> - CSS规则的简便写法无效，比如想读取`margin`属性的值，不能直接读，只能读`marginLeft`、`marginTop`等属性。
> - 如果一个元素不是绝对定位，`top`和`left`属性总是返回`auto`。
> - 该方法返回的样式对象的`cssText`属性无效，返回`undefined`。
> - 该方法返回的样式对象是只读的，如果想设置样式，应该使用元素节点的`style`属性。

------

- 直接添加样式表。

可以通过创建style标签来添加内置样式表。

或者通过创建link标签来引入外部样式表。

```javascript
var style1 = document.createElement('style');
style1.innerHTML = 'body{color:red}#top:hover{background-color: red;color: white;}';
document.head.appendChild(style1);

var link1 = document.createElement('link');
link1.setAttribute('rel', 'stylesheet');
link1.setAttribute('type', 'text/css');
link1.setAttribute('href', 'reset-min.css');
document.head.appendChild(link1);
```

