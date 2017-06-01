---
layout: post
title: "对HTML5中section标签的一点理解"
image: ''
date:   2016-10-31 22:30:18
tags:
- HTML5
description: ''
categories:
- HTML
serie: learn
---

一直对HTML5中的某些语义化标签具体该如何具体应用的理解有点模糊，今天稍微研究了一下，在w3c的html标准中是这么写的：

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1477925844/blog/section.png">

The section element represents a   generic section of a document or application. A section, in this   context, is a thematic grouping of content, typically with a   heading.

section标签应该包含了非特定的一段普通文档或者应用，它的内容的主题性应该是很明确的，所有通常有一个标题。

Examples of sections would be chapters, the   various tabbed pages in a tabbed dialog box, or the numbered   sections of a thesis. A Web site's home page could be split into   sections for an introduction, news items, and contact   information.

典型的例子包括了章节、可切换型的多标签页的对话框中的标签页，或者带有数字编号的论文小节。比如说一个网页的主页可以分为简单介绍、新闻、联系方式等几个section。

Note: Authors are encouraged to use the   article element instead of the section   element when it would make sense to syndicate the contents of the   element.

注意一：在需要聚合多块内容的时候，最好是使用article标签而不是section标签。这意味着section标签相比于前后内容来说，它的独立性更强。

Note: The section   element is not a generic container element. When an element is   needed only for styling purposes or as a convenience for scripting,   authors are encouraged to use the div element instead.   A general rule is that the section element is   appropriate only if the element's contents would be listed   explicitly in the document's outline.

注意二：section并不是一个单纯的容器标签。当元素仅仅因为需要改变样式或者方便脚本的使用，应该使用div标签。通常来说，只有这个元素里面的内容清晰明确的属于整个文档的大纲中，此时使用section标签才是合适的。