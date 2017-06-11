---
layout: post
title: "css3 flexbox"
image: ''
date:   2016-11-13 20:38:18
tags:
- flex
- css
description: ''
categories:
- CSS3
serie: learn
---

关于css3 flex一些属性的效果详解。

首先设置一个class为container的div容器，并包含了5个class为flex-item的子元素。为了方便查看效果设置了宽高等基础的样式。默认的显示效果如图：

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1479038185/blog/Screen_Shot_2016-11-13_at_19.41.37.png">

html结构为：

```html
<div class="container">
  <div class="flex-item"></div>
  <div class="flex-item"></div>
  <div class="flex-item"></div>
  <div class="flex-item"></div>
  <div class="flex-item"></div>
</div>
```

给container添加`display: flex;`（为了方便查看后续效果，这里给五个子元素设置了不同的高度，并且写上了序号），子元素的div排列发生改变：（**注意，设为Flex布局以后，子元素的float、clear和vertical-align属性将失效。**）

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1479038593/blog/Screen_Shot_2016-11-13_at_20.02.26.png">

可以看到五个元素并排排列，并且顶部是对齐的，并且默认的样式是不会随着浏览器宽度变化换行的。为了改变样式就引入了后续几个属性。

#### 关于父元素容器的设置：

首先是`justify-content`，这个属性定义了浏览器如何分配容器主轴上的子元素之间的空间。

The [CSS](https://developer.mozilla.org/en-US/docs/CSS) **justify-content** property defines how the browser distributes space between and around flex items along the main-axis of their container.

```css
/* 从行首起始位置开始排列 (默认值)*/
justify-content: flex-start;

/* 从行尾位置开始排列 */
justify-content: flex-end;

/* 居中排列 */ 
justify-content: center;

/* 均匀排列每个元素
首个元素放置于起点，末尾元素放置于终点 */
justify-content: space-between;

/* 均匀排列每个元素
每个元素周围分配相同的空间 */
justify-content: space-around;
```

可以通过下面的图片来查看具体的效果：

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1479039931/blog/Screen_Shot_2016-11-13_at_20.13.09.png" alt="">

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1479039931/blog/Screen_Shot_2016-11-13_at_20.13.26.png" alt="">

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1479039931/blog/Screen_Shot_2016-11-13_at_20.14.24.png" alt="">

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1479039931/blog/Screen_Shot_2016-11-13_at_20.14.41.png" alt="">

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1479039932/blog/Screen_Shot_2016-11-13_at_20.24.01.png" alt="">

第二个是`align-item`，和`justify-content`类似的方式，只是是在纵轴的方向上设置。

```css
/* 对齐到侧轴起点 */
align-items: flex-start;

/* 对齐到侧轴终点 */
align-items: flex-end;

/* 在侧轴上居中 */
align-items: center;

/* 与基准线对齐 */
align-items: baseline;

/* 拉伸元素以适应 */
align-items: stretch;
```

第三个是`align-content`，定义了有多行时在纵轴上如何排布：

- flex-start：与纵轴的起点对齐。
- flex-end：与纵轴轴的终点对齐。
- center：与纵轴轴的中点对齐。
- space-between：与纵轴轴两端对齐，轴线之间的间隔平均分布。
- space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
- stretch（默认值）：轴线占满整个交叉轴。



#### 关于子元素的设置：

- `order`规定了子元素的顺序，如给1号子元素设置order为5，那么1号的位置就换到了最后：

  ```css
  .flex-item:nth-child(1): {
    order : 5;
  }
  ```

<img src="http://res.cloudinary.com/dxmlgmzb7/image/upload/v1479143768/blog/Screen_Shot_2016-11-15_at_01.15.11.png" alt="">

- `flex-grow`设置了元素的放大比例，如果为0表示不放大。如果所有元素的flex-grow都为1，则平分**剩余大小**（不是大小相同，是平分剩余的大小）。


- `flex-shrink`属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。如果所有项目的flex-shrink属性都为1，当空间不足时，都将等比例缩小。如果一个项目的flex-shrink属性为0，其他项目都为1，则空间不足时，前者不缩小。
- `align-self`属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。
- `flex-basis`属性定义了在分配多余空间之前，项目占据的大小（纵向排列时是height，横向排列时是width）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小。
- `flex`属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto。后两个属性可选。

