---
layout: post
title: "about DOM extension"
image: '不要轻易为DOM对象添加自定义属性和方法。'
date:   2016-11-20 10:33:18
tags:
- DOM
description: ''
categories:
- Javascript
serie: learn
---

### 不要轻易为DOM对象添加自定义属性和方法。

最近在研究js的框架设计，见的比较多的是封装成对象的方法而不是仅仅封装在一个函数里，这样使用的时候更加方便，但针对dom对象的时候鲜少有直接为dom对象的原型添加方法，查了下中文这方面相关的资料很少，但是有篇2010年的英文博客写的很是详细，所以简单翻译一下，不过毕竟是六年前的文章了，有错漏的欢迎指出。

#### What's wrong with extending the DOM

我最近很惊讶的发现网上关于dom扩展方面的资料非常非常少，难怪如今有些库和插件都会掉到这个陷阱里面。这篇文章我想解释一下为什么扩展dom不是个好主意。

首先来看下什么叫dom扩展（DOM extension），以及它是如何运行的。

#### How DOM extension works

所谓dom扩展就是直接为dom对象添加自定义的方法和属性。扩展的时候，就是把定义好的方法或者属性直接添加给dom对象或者dom对象的原型（必须在合适的环境下）。

最常见的被扩展的可能就是dom元素，比如`Element`对象，像比较流行的Prototype，Mootools等库，同样的还有`Event`和`document`对象。

通常的写法就像下面这样：

```javascript
Element.prototype.hide = function() {
    this.style.display = 'none';
};
  ...
var element = document.createElement('p');

element.style.display; // ''
element.hide();
element.style.display; // 'none'
```

你可以看到hide()方法被添加给了`Element.prototype`，因此你可以直接让一个dom元素调用这个方法，直接设置它为不可见。

之所以可以这样是因为`Element.prototype`就是`P`元素的原型链中的一个对象，当调用了hide方法以后，它就沿着原型链一路往上查找，直到发现`Element.prototype`中规定了这么一个方法。

实际上，我们如果在现代的浏览器中检查原型链，应该是这样的：

```javascript

  // "^" denotes connection between objects in prototype chain

  document.createElement('p');
    ^
  HTMLParagraphElement.prototype
    ^
  HTMLElement.prototype
    ^
  Element.prototype
    ^
  Node.prototype
    ^
  Object.prototype
    ^
  null
```

你可以注意到`P`元素的原型链中最近的一个应该是`HTMLParagraphElement.prototype`，这是这个类型的元素特定的一个对象，对应的div元素的话应该是`HTMLDivElement.prototype`，对应`a`元素的话则应该是`HTMLAnchorElement.prototype`，以此类推。

你可能会问，为什么有这么多奇怪的名字呢？

这些名字实际上是[等级2的DOM接口说明](https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-798055546)所定义的，它也定义了这些接口间的继承关系，比如说：

> “… HTMLParagraphElement interface have all properties and functions of the HTMLElement interface …” and that “… HTMLElement interface have all properties and functions of the Element interface …”

很明显的，如果我们给`P`元素的最近一个“原型对象”创建一个属性，那么这个属性是不会存在于，比如`a`元素上的。

```javascript
HTMLParagraphElement.prototype.hide = function() {
  this.style.display = 'none';
};
...
typeof document.createElement('a').hide; // "undefined"
typeof document.createElement('p').hide; // "function"
```

这是因为`a`元素的原型链上并没有包含`HTMLParagraphElement.prototype`对象，为了解决这么一个问题，我们可以去修改原型链上更高级的原型对象的属性，比如说`HTMLElement.prototype`，`Element.prototype`或者`Node.prototype`。

类似的，在 `Element.prototype` 上创建属性的话，也并不会让所有的节点都可以使用，而只会让元素类型的节点能使用。如果要让所有的节点，包括文本节点，注释节点都能使用呢？那就需要为`Node.prototype`去添加属性。另外说到文本节点和注释节点，他们的原型链是这样的：

```javascript
 document.createTextNode('foo'); 
// < Text.prototype < CharacterData.prototype < Node.prototype

  document.createComment('bar'); 
// < Comment.prototype < CharacterData.prototype < Node.prototype
```

现在，必须明白很重要的一个问题：这些DOM对象的原型不一定是可以访问的。DOM等级2说明只是定义了接口和他们的继承关系，它并没有规定应该有一个全局的`Element`或者`Node`属性，来引用`Element`或者`Node`接口的原型对象。

举个例子，IE及以下，就是这样一个环境，它并没有暴露出一个全局的 `Node`， `Element`，`HTMLElement`，`HTMLParagraphElement`或其他属性。

那么这样没有暴露全局的原型对象的环境下我们应该怎么做呢？有一个变通的办法就是直接添加给DOM对象：

```javascript
var element = document.createElement('p');
...
element.hide = function() {
  this.style.display = 'none';
};
...
element.style.display; // ''
element.hide();
element.style.display; // 'none'
```

#### What went wrong?

通过给DOM元素的原型对象添加属性看上去挺好的，我们可以利用Javascript基于原型的天性，让操控DOM也变得很面向对象。实际上，好几年以前的时候，DOM扩展是非常有诱惑力非常有用的，很流行的 [PrototypeJs](http://prototypejs.org/) 就使这一点成为了它的基础架构。但是这后面实际上隐藏了无数的问题。比如我稍后就会提到的跨浏览器编写脚本，这一方式带来的问题就远远超过了收益。**DOM扩展应该是Prototype.js所犯过的最大的错误之一。**

那么，有哪些问题呢？

#### Lack of specification 缺乏文档说明

像我之前提到的，原型对象的暴露并不在标准文档de说明之中，DOM等级2只定义了接口和他们之间的继承关系，也就是说完全遵从DOM等级2的标准并没有要求提供一个全局的 `Node`, `Element`, `HTMLElement`等对象的接口。虽然通常来说我们都有办法去手动扩展DOM对象，这看上去并不是一个很大的问题，但是手动扩展是非常慢和很不方便的（我们等下就会看到）。而快速的，基于原型对象的扩展这一做法让今后的改版或者多种不同标准的移动平台上就很容易出现问题。

#### Host objects have no rules 宿主对象没有任何规则

下一个问题就是，DOM对象都是宿主对象，在ECMA-262 3rd. ed的说明中，宿主对象可以背允许做一些其他对象想都不敢想的事情：

> Host objects may implement these internal methods with any implementation-dependent behaviour, or it may be that a host object implements only some internal methods and not others.

上面说到的这些内部方法就是[[Get]], [[Put]], [[Delete]]等等。注意这句：**internal methods behavior is implementation-dependent**。这也就意味着，在调用，比如说，get方法出现错误是非常正常的。在IE中，我们可以很轻易的观察到这一现象：

```javascript
document.createElement('p').offsetParent; // "Unspecified error."
new ActiveXObject("MSXML2.XMLHTTP").send; // "Object doesn't support this property or method
```

还有一个例子是 `applet`, `object` 和 `embed`这些元素, 可以看这里 [throw errors on assignment of properties](http://github.com/jquery/jquery/commit/59802928566b6be3a66d65e77c2418fff37e6f5f). 类似的，对于XML节点也有:

```javascript
var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
xmlDoc.loadXML('<foo>bar');
xmlDoc.firstChild.foo = 'bar'; // "Object doesn't support this property or method"
```

IE中还有一些问题可以看这里： [other cases of failures in IE](http://jibbering.com/faq/notes/code-guidelines/#hostObjects)，比如 `document.styleSheets[99999]`会抛出"Invalid procedure call or argument"错误， `document.createElement('p').filters` 会抛出 "Member not found."同样的，在火狐中尝试修改event对象的target属性会造成TypeError错误，因为这是一个readonly 的属性。在webkit内核的浏览器中，同样也会造成错误，因为target属性在被赋值后会持续引向原始对象。

#### Chance of collisions 可能造成冲突

#### Performance overhead 性能瓶颈

#### IE DOM is a mess 

#### Bonus: browser bugs 浏览器bug

#### Wrappers to the rescue 解决方案：wrappers

针对DOM扩展这一问题最常用的解决方法就是对象包装，这也是jQuery最开始使用这种方法的，之后很多其他的库也开始学习这种方法。办法很简单，与其直接扩展元素或者对象，不如创建一个包裹他们的容器，然后针对容器去进行扩展。没有冲突，不需要去管宿主对象，能更轻松的管理泄漏和控制过时的MSHTML DOM，更好的性能，维护性和大规模运用也没有问题。

原文没有写具体如何操作，此处插入stackoverflow上的一个回答，原地址在[这里](http://stackoverflow.com/questions/779880/in-javascript-can-you-extend-the-dom)：

```javascript
var myDOM = (function(){
    var myDOM = function(elems){
            return new MyDOMConstruct(elems);
        },
        MyDOMConstruct = function(elems) {
            this.collection = elems[1] ? Array.prototype.slice.call(elems) : [elems];
            return this;
        };
    myDOM.fn = MyDOMConstruct.prototype = {
        forEach : function(fn) {
            var elems = this.collection;
            for (var i = 0, l = elems.length; i < l; i++) {
                fn( elems[i], i );
            }
            return this;
        },
        addStyles : function(styles) {
            var elems = this.collection;
            for (var i = 0, l = elems.length; i < l; i++) {
                for (var prop in styles) {
                    elems[i].style[prop] = styles[prop];
                }
            }
            return this;
        }
    };
    return myDOM;
})();
```

然后就可以通过`myDOM.fn...`来添加自己的方法，也可以像这样：

```javascript
myDOM(document.getElementsByTagName('*')).forEach(function(elem){
    myDOM(elem).addStyles({
        color: 'red',
        backgroundColor : 'blue'
    });
});
```

另外一个[例子](http://stackoverflow.com/questions/16279025/using-object-wrappers-to-extend-the-javascripts-dom)：

```javascript
(function() {
    window.wrap = function(el) {
        return new Wrapper(el);
    };

    function Wrapper(el) {
        this.element = el;
    }

    Wrapper.prototype.addClass = function(cls) {
        if (this.element)
            this.element.className += " " + cls;
    }
    Wrapper.prototype.swap = function(el) {
        this.element = el;
    }
})();
```

然后可以如此使用：

```javascript
var wrp = wrap(document.body);

wrp.addClass("foo");
wrp.swap(document.body.firstElementChild);
wrp.addClass("bar");
```

如果再给所有的方法最后添加一句`return this`，就可以像jQuery一样chainning：

```javascript
var wrp = wrap(document.body);

wrp.addClass("foo")
   .swap(document.body.firstElementChild)
   .addClass("bar");
```



*Reference:*

[http://perfectionkills.com/whats-wrong-with-extending-the-dom/](http://perfectionkills.com/whats-wrong-with-extending-the-dom/)

[http://stackoverflow.com/questions/779880/in-javascript-can-you-extend-the-dom](http://stackoverflow.com/questions/779880/in-javascript-can-you-extend-the-dom)

[http://stackoverflow.com/questions/16279025/using-object-wrappers-to-extend-the-javascripts-dom](http://stackoverflow.com/questions/16279025/using-object-wrappers-to-extend-the-javascripts-dom)

[http://perfectionkills.com/extending-native-builtins/](http://perfectionkills.com/extending-native-builtins/)