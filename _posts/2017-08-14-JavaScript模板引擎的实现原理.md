---
layout: post
title: "JavaScript模板引擎的实现原理"
date: 2017-08-14 14:59:41
tags:
- template
- compiler
description: "只用几十行代码来实现一个简单的JavaScript模板引擎"
---

### 前言

继续我们对于编译的学习，这一次我们来尝试实现一个简单的JS模板引擎，模板引擎在许多地方都有应用到，比如vue中的数据的动态替换，webpack的html-webpack-plungin插件，node中的jade模板引擎等，使得我们可以直接在html文件中使用JavaScript的语法来动态生成我们需要的html，或是动态替换html中的变量。

我们来把问题具象化为下面的例子：

```html
<!-- template -->
<p>Hello, my name is <%name%>. I\'m <%age%> years old.</p>
```

我们需要实现一个js函数，来将其中的name和age变量替换为我们所提供的值，出于简化的原因，这里我们直接把这一串html代码当成js中的字符串来处理，而不使用node中的readFile了。

```js
var tplEngine = function(tpl, data) {
  // ...code here
}

var tpl = '<p>Hello, my name is <%name%>. I\'m <%age%> years old.</p>'

tplEngine(tpl, {
  name: "jack",
  age: 29
})
// should return <p>Hello, my name is jack. I'm 29 years old.</p>
```

### 正则表达式提取

使用正则表达式是最简单粗暴的做法，直接找到字符串中的变量部分然后来替换。

```js
var reg = /<%([^%>]+)?%>/g
var tpl = '<p>Hello, my name is <%name%>. I\'m <%age%> years old.</p>'
var match

while (match = reg.exec(tpl)) {
  console.log(match)
}
```

可以看到上述代码的结果是：

```js
[ '<%name%>',
  'name',
  index: 21,
  input: '<p>Hello, my name is <%name%>. I\'m <%age%> years old.</p>' ]
[ '<%age%>',
  'age',
  index: 35,
  input: '<p>Hello, my name is <%name%>. I\'m <%age%> years old.</p>' ]
```


### 流程控制语法

在替换的时候我们如果将其看作字符串，使用字符串的replace等方法在这个简单的例子里是可以达成目的的，但是实际使用中就没有这么简单了，我们可能会碰到多层次的对象结构，甚至是js的循环、判断等流程控制的语法。因此有必要将其当作js代码来执行。

```js
return '<p>Hello, my name is ' + data.name + ', and I\'m ' + data.info.age + ' years old.</p>'
```

但对于循环的话:

```js
var template = 
'My skills:' + 
'<% for(var index in this.skills) { %>' +
'<a href=""><%this.skills[index]%></a>' +
'<% } %>';

// 如果继续采用上面的方式，得到的结果会报错：
return 'My skills:' +
for(var index in this.skills) { +
'<a href="">' +
this.skills[index] +
'</a>' +
}

// 而我们需要的应该是这样的：
return 'My skills:' + 
'<a href="">' + 
this.skills[0] +
'</a>' +
'<a href="">' + 
this.skills[1] +
'</a>' +
'<a href="">' + 
this.skills[2] +
'</a>' +
```

这就比较容易看出来了，我们可以使用一个数组来控制其内容，使得只把需要的内容push进数组，而流程控制的代码则在外部负责，这样代码应该是这个样子:

```js
var r = [];
r.push('My skills:'); 
for(var index in data.skills) {
  r.push('<a href="">');
  r.push(data.skills[index]);
  r.push('</a>');
}
return r.join('');
```

但是在这之前，我们的字符串首先要转换转换成上面的js代码才能获得最后的结果，这个转换的过程要如何完成呢，我们需要利用 `new Fucuntion()` 构造函数来实现，它接受两个参数，第一个作为结果函数的参数，第二个则作为函数语句，举一个简单的例子：

```js
var fn = new Function('args', 'console.log(args)')
fn('hello world')

// 其结果等同于：
var fn = function(args) {
  console.log(args)
}
```

那么现在我们需要通过构造一个字符串来把之前的一串流程控制和内容添加进数组的语句来作为我们的第二个参数：

```js
var data = {
  name: 'jack',
  age: 29,
  skills: ["js", "html", "css"]
}
var reg = /<%([^%>]+)?%>/g
var tpl = '<p>Hello, my name is <% data.name %>. I\'m <% data.age %> years old.</p>' + 
'<p>My skills are <% for (var index in data.skills) { %>' +
'<a href="#"><% data.skills[index] %></a>' +
'<% } %></p>'
var match
var code = 'var r = [];\n'
var cursor = 0

var add = function(line) {
  code += 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
}
while (match = reg.exec(tpl)) {
  add(tpl.slice(cursor, match.index));
  add(match[1]);
  cursor = match.index + match[0].length;
}

// 运行后code的结果为(字符串)，作为第二个参数传入后相当于以下代码：
var r = [];
r.push("<p>Hello, my name is ");
r.push("data.name");
r.push(". I'm ");
r.push("data.age");
r.push(" years old.</p><p>My skills are ");
r.push("for (var index in data.skills) {");
r.push("<a href=\"#\">");
r.push("data.skills[index]");
r.push("</a>");
r.push("}");
```

可以看到，我们实际上需要的js代码也被当成字符串用双引号包起来了，因此需要在add函数上多做一个判断：

```js
var add = function(line, js) {
  js ? code += 'r.push(' + line + ');\n'
     : code += 'r.push("' + line.replace(/"/g, '\\"') + '");\n'
}
```

另外，流程控制的for循环语句也被push进了数组，但是实际上我们需要的是直接当成js执行，把循环语句内部的代码反复push进数组，因此add函数内部继续改进：

```js
var reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g
var add = function(line, js) {
  js ? code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n'
     : code += 'r.push("' + line.replace(/"/g, '\\"') + '");\n'
}
```

那么终于最后的code结果就是我们想要的了：

```js
var r = [];
r.push("<p>Hello, my name is ");
r.push(data.name);
r.push(". I'm ");
r.push(data.age);
r.push(" years old.</p><p>My skills are ");
for (var index in data.skills) {
r.push("<a href=\"#\">");
r.push(data.skills[index]);
r.push("</a>");
}
```

这样我们就可以将其传入function构造函数来把字符串直接作为js代码执行，最后的代码就类似下面这样:

```js
var TemplateEngine = function(html, options) {
  var re = /<%([^%>]+)?%>/g,
    reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
    code = 'var r=[];\n',
    cursor = 0,
    match;
  var add = function(line, isJs) {
    isJs ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n')
         : (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
  }
  while (match = re.exec(html)) {
    add(html.slice(cursor, match.index));
    add(match[1], true);
    cursor = match.index + match[0].length;
  }
  add(html.substr(cursor, html.length - cursor));
  code += 'return r.join("");';
  return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
}

var data = {
  name: 'jack',
  age: 29,
  skills: ["js", "html", "css"]
}
var tpl = '<p>Hello, my name is <% this.name %>. I\'m <% this.age %> years old.</p>' +
  '<p>My skills are <% for (var index in this.skills) { %>' +
  '<a href="#"><% this.skills[index] %></a>' +
  '<% } %></p>'

TemplateEngine(tpl, data)
// 结果
// <p>Hello, my name is jack. I'm 29 years old.</p><p>My skills are <a href="#">js</a><a href="#">html</a><a href="#">css</a></p>
```
