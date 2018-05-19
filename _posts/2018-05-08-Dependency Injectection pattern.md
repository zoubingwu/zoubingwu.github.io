---
layout: post
title: "Dependency Injectection pattern"
date: 2018-05-08 22:19:31
tags:
- patterns
description: "Dependency injection is an important application design pattern. It's used so widely that almost everyone just calls it DI."
---

依赖注入模式是应用开发中一种广泛使用的设计模式，要弄清楚为什么依赖注入模式很重要，我们可以直接来看看下面的例子。

```js
export class Car {

  public engine: Engine;
  public tires: Tires;
  public description = 'No DI';

  constructor() {
    this.engine = new Engine();
    this.tires = new Tires();
  }

  drive() {
    return `${this.description} car with ` +
      `${this.engine.cylinders} cylinders and ${this.tires.make} tires.`;
  }
}
```

我们在汽车这个类的构造函数里直接创建一个新的引擎和轮胎的实例，初看上去这样的代码是 ok 的，但是当引擎或者轮胎这两个类出现改动时，这样的代码维护性就有问题了。

当修改了 Engine 这个 class，例如创建实例时需要额外的参数，那么同样需要修改 Car 这个 class 内部的代码，并且每当 new 一个新的 Car 时，他们都会有自己的独立的固定的 Engine 实例，使得代码非常的不灵活。

换句话说，Car class 依赖着 Engine 和 Tires 这两个类，但这两个类都是内部写死的，外部没有任何办法能接触到，这一点对代码的灵活性，健壮性都提出了挑战，同时也不方便编写测试代码。

我们怎么改动比较好一点呢？也很简单，直接使用参数来将依赖传入就可以了：

```js
constructor(public engine: Engine, public tires: Tires) { }

```

使用的时候就可以直接：

```js
let car = new Car(new Engine(), new Tires());

```

这样 Engine 和 Tires 都从 Car 中解耦出来，针对 Car 的测试时，我们也可以传入任何需要 mock 的依赖进去：

```js
class MockEngine extends Engine { cylinders = 8; }
class MockTires  extends Tires  { make = 'YokoGoodStone'; }

// Test car with 8 cylinders and YokoGoodStone tires.
let car = new Car(new MockEngine(), new MockTires());
```

这就是最基本的依赖注入模式，其实概念非常简单，依赖由外部注入，而非自己内部创建。


ref:

[https://angular.io/guide/dependency-injection-pattern](https://angular.io/guide/dependency-injection-pattern)
