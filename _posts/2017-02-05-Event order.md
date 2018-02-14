---
layout: post
title: "Event order"
image: ''
date:   2017-02-05 23:03:18
tags:
- javascript
description: ''
categories:
- javascript
serie: learn
---

<img src="https://s3.amazonaws.com/37assets/svn/845-bubbling.png">

一篇详细解释事件顺序的博文，虽然有点老不过感觉写的非常好，决定翻译一下。

原文地址：http://www.quirksmode.org/js/events_order.html#link4

我之前在[上一篇](http://www.quirksmode.org/js/introevents.html)事件介绍的博文中问过一个似乎很难理解的问题：如果一个元素和他的上层元素对同一个事件都有着事件处理方法，那么究竟谁应该先启动呢？不出意外，答案取决于何种浏览器。

比如说你有一个元素处于另一个元素之内：

```
-----------------------------------
| element1                        |
|   -------------------------     |
|   |element2               |     |
|   -------------------------     |
|                                 |
-----------------------------------
```

他们都有一个onClick事件的处理方法，那么当用户点击了element2的时候会同时触发2和1的点击方法，这两个方法谁先被调用呢？换句话说，事件的顺序是怎样的呢？

### 两种模型

不用惊讶，在很久以前，Netscape和Microsoft给出的是两个完全不同的结论。

- Netscape说element1的点击方法先触发，这个叫事件捕获（event capturing）。
- Microsoft认为element2的点击方法应该先触发，这个叫事件冒泡（event bubbling）

这两种顺序截然相反。

#### Event capturing 事件捕获

当你使用事件捕获的时候：

```
               | |
---------------| |-----------------
| element1     | |                |
|   -----------| |-----------     |
|   |element2  \ /          |     |
|   -------------------------     |
|        Event CAPTURING          |
-----------------------------------
```

事件的方法会先从element1开始，最后到element2。

#### Event bubbling 事件冒泡

当你使用事件冒泡的时侯：

```
               / \
---------------| |-----------------
| element1     | |                |
|   -----------| |-----------     |
|   |element2  | |          |     |
|   -------------------------     |
|        Event BUBBLING           |
-----------------------------------
```

事件的方法则首先从element2开始，最后到element1。

### W3C model

w3c在这两种相反的方法中选择了一条折中的处理方式。在w3c的事件模型中，会首先捕获直到目标元素，然后再一路往上级冒泡到顶层。

```
                 | |  / \
-----------------| |--| |-----------------
| element1       |1|  |2|                |
|   -------------| |--| |-----------     |
|   |element2    \ /  | |          |     |
|   --------------------------------     |
|        W3C event model                 |
------------------------------------------
```

而你作为开发者就可以在注册事件触发方法的时侯选择在冒泡阶段还是捕获阶段，只需要通过`addEventListener()`，这个方法提供三个参数，而最后一个参数就是一个布尔值，true为捕获阶段，而false则为冒泡阶段。

比如说：

```javascript
element1.addEventListener('click',doSomething2,true)
element2.addEventListener('click',doSomething,false)
```

那么用户点击了element2的时候，就会发生如下事情：

1. 在捕获阶段，首先从element2的最上级元素开始一路往下检查是否有为了捕获阶段的点击事件方法。
2. 浏览器发现了element1上有这样一个doSomeThing2方法符合条件，于是就马上调用了它。
3. 事件继续向下一直到目标元素element2，都没有再发现捕获阶段的点击事件方法了，此时开始进入冒泡阶段，执行了element2上为冒泡阶段设置的doSomething方法。
4. 事件一路向上冒泡直到最顶层，都没有再发现任何冒泡阶段的点击事件方法，于是一次事件结束。

我们现在反过来看：

```javascript
element1.addEventListener('click',doSomething2,false)
element2.addEventListener('click',doSomething,false)
```

现在用户点击element2的时候发生的是：

1. 首先是事件的捕获阶段，从最上级往下开始检查有无点击事件的方法，然而并没有。
2. 一路向下直到目标元素element2，然后进入冒泡阶段，开始执行doSomething方法。
3. 继续一路往上冒泡，发现父级元素element1上注册了一个冒泡阶段的点击事件的方法，于是执行了doSomething2。
4. 再继续向上冒泡，找不到任何东西了，事件结束。


### 事件冒泡的使用

有一些开发者会有意地去使用事件冒泡或捕获。在当今的网站页面上，其实没有必要让同一个事件去触发几个不同的事件处理方法，这可能会让用户感到很困惑。最好是用户点击了一个元素，触发一件事，点击另一个元素，再触发另外一件不同的事。

未来也许会有变化，但是目前事件的捕获和冒泡最主要还是运用于注册默认的函数。

### It always happens

你首先需要理解的是，事件的冒泡或者捕获总是会发生的，如果你给整个document定义了一个点击事件：

```javascript
document.onclick = doSomething;
if (document.captureEvents) document.captureEvents(Event.CLICK);
```

那么任何元素上的任何点击事件，都会冒泡到documenet从而触发这个方法。除非之前有一个事件处理函数内部明确规定了停止冒泡。那么它就不会一路往上直到document。

### 使用

因为所有的事件最后都会冒泡的document，那么就可以设置一个默认的事件处理方法：

```
------------------------------------
| document                         |
|   ---------------  ------------  |
|   | element1    |  | element2 |  |
|   ---------------  ------------  |
|                                  |
------------------------------------

element1.onclick = doSomething;
element2.onclick = doSomething;
document.onclick = defaultFunction;
```

如果用户点击了element1或者2，那么doSomeThing方法就会被触发，如果需要的话，你可以在这里停止冒泡。否则会继续触发defaultFunction方法，用户点击了其他的地方，defaultFunction方法也会被触发。

设置一个document级别的事件在那种拖拽的脚本中是有必要的。通常来说，在某一层上的`onmousedown`事件会选中这一层并使之对`onmousemove`事件回应。尽管一般`onmousedown`事件会注册在那一层上来避免一些bug，但是其他的事件就必须是document级别了。

开发第一铁律一定要记住，坏事一定会发生，尤其是你没有准备的时候。所以很有可能用户移动鼠标的范围特别大而程序没有跟上，鼠标从而不在位于那一层之上了，此时：

- 如果`onmousemove`事件注册在层上，那么层就不会随着鼠标的移动而移动了。
- 如果`onmouseup`事件注册在层上，那么这个事件并不会随着鼠标抬起而触发，导致层会一直随鼠标移动，无法按用户希望的那样放下在合适的位置。

这种情况的时候，事件冒泡就很有用了，把你的事件触发注册在document级别可以让他们总是在被及时的触发。

### 关闭

不过通常来说你会想关闭掉所有的事件冒泡和捕获，防止不同的函数互相受到影响。另外，如果你的文件结构很复杂，那么你可能也需要关闭冒泡来节省系统资源。因为浏览器总是会检查目标元素的每一个上级元素来查看是否有事件触发的方法，哪怕找不到，这样一个搜索的过程也是需要消耗资源的。

在Miscrosoft模型中，你需要把`event`的`cancelBubble` 属性设置为`true`：

```javascript
window.event.cancelBubble = true
```

在w3c模型中，你则需要使用`stopPropagation()`方法：

```javascript
e.stopPropagation()
```

对于需要多浏览器支持的话，你可以这么写：

```javascript
function doSomething(e)
{
	if (!e) var e = window.event;
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
}
```

### 当前目标

我们之前看到过，事件有一个`target`或者`srcElement`属性，指向了事件发生的目标元素。比如本文开头的例子里的用户点击的element2。

这点是非常重要的，不管冒泡还是捕获阶段，这个指向的目标元素都是不会改变的。

但是假如我们是这么注册事件的：

```javascript
element1.onclick = doSomething;
element2.onclick = doSomething;
```

如果用户点击了element2，doSomething会执行两次。那么我怎么知道当前到底是哪个html元素在处理这个事件呢，`target`或者`srcElement`总是指向的element2，并不能解答这个问题。

因此w3c加入了一个`currentTarget`属性，它指向的是当前正在处理事件的html元素，正好就是我们想要的答案。