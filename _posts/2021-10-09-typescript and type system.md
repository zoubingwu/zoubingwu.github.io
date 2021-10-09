---
layout: post
title: "typescript and type system"
date: 2021-10-09 16:12:33
tags:
- typescript
description: "concepts in typescript and type system"
---

节选自之前在公司内做的一个分享，总结一些类型系统中的基础概念。

## 为什么需要类型系统

### 区分代码和数据

在底层硬件和机器码的级别，程序逻辑和数据是没有任何区别的，但是系统如果区分错误，则会发生错误。举一个不那么典型的例子，在 JavaScript 中臭名昭著的 eval 函数，一不小心就容易搞错字符串和代码逻辑。


```js
console.log(eval("40 + 2")) // OK

console.log(eval("Hello world!")) // Error!
```

### 解释数据，类型为数据赋予了更多的意义

对于机器来说，类型限制了一个变量可以接受的有效值的集合，同时还赋予了很多的安全属性（例如像 private，protected 这样的修饰符）。

对于人类来说，类型赋予了其一个更加容易理解和记忆的意义，让程序有更好的可读性，更容易被其他人理解。

从逻辑上来说，遵守类型系统相当于一种逻辑证明，可以为程序的正确运行带来逻辑上的严谨性保证，从而为程序提供了正确性和安全性的保障。

例如对于硬件中的 16 位二进制序列来说，它的含义可以使无符号的 16 位整数，也可以是有符号的 16 位整数，那么它对应的 uint16 和 int16 类型以及相应的取值范围都是不同的。

## 类型系统的分类

对于类型系统的实际上并没有严格的分类标准，但从不同的维度和指标出发，我们可以对类型系统进行一些粗略的分类。例如：

- Strong vs. Weak
- Static vs. Dynamic
- Manifest vs. Inferred
- Nominal vs. Structural

等等，下面就简单介绍一下各个分类的含义。

### Strong vs. Weak

强弱类型主要是描述类型系统在实施类型约束的时候的严格程度，弱类型系统往往会隐式的尝试把值从其实际类型转换为使用该值时期望的类型，而强类型只会做很少的（甚至于完全不允许）隐式类型转换。像 JavaScript 很明显就是弱类型了，典型的例子就是双等号：

```js
"42" == 42 // true
```

### Static vs. Dynamic

静态和动态类型的区别主要在于类型检查的实际，动态类型将类型检查推迟到了运行时，所以会出现运行时错误，例如在 JavaScript 中我们调用了一个对象上不存在的方法，会抛出错误 `Uncaught TypeError: xxx is not a function`。而静态类型在编译时期就可以确定类型，进行类型检查，当不匹配时会出现编译错误。

让这些错误在编译时期被发现从而避免程序运行出现问题，是静态类型的主要优势。

看到这里，自然我们就明白了，更准备的说法， TypeScript 应该是一个静态类型语言，而不是很多人误会成的强类型语言。

### Manifest vs. Inferred

这两者的区别主要是字面意义上的，在于是否需要显示的进行类型声明或者可以通过编译器的类型推断，来减少主动的类型声明。为了开发的效率和体验，大部分语言都是支持类型推断的。

### Nominal vs. Structural

Nominal 类型系统比较的是类型本身，具备非常强的一致性要求。而结构类型系统比较的是类型定义的形状。也有说法叫鸭子类型（Duck typing），我不管它究竟是什么，只要它能像鸭子一样游水，走路，呱呱叫，那么我就认为它是鸭子。

在 C# 中使用的就是 Nominal 类型系统：

```
public class Foo {
	public string Name { get; set; }
	public int Id { get; set; }
}

public class Bar {
	public string Name { get; set; }
	public int Id { get; set; }
}

Foo foo = new Foo(); // Ok
Bar bar = new Foo(); // Error!
```

而在 TypeScript 中使用的结构化的类型系统：

```ts
class Foo {
	method() {}
}

class Bar {
	method() {}
}


const foo: Foo = new Foo(); // Ok
const bar: Bar = bew Foo(); // Ok
```

## TS 类型系统

TS 和 C# 都是由 Anders Hejlsberg 的负责设计的两门编程语言，这两者其实也有非常多的相似之处。 TypeScript 在设计之初就是作为 JavaScript 的超集，不可避免要考虑到 JS 本身的灵活特性，结构类型系统和 JS 一脉相承，是非常自然的选择。

> One of TypeScript’s core principles is that type checking focuses on the shape that values have. This is sometimes called “duck typing” or “structural subtyping”.

TypeScript 只检查 Shape，即类型定义的约束条件，这和集合（Set）的概念非常类似。 比如说 Point 类型实际就上就可以理解为一种集合：

```ts
Point {
	x: number;
	y: number;
}
```

它对应了，只要满足下面条件的类型，就符合 Point 类型：

```js
typeof obj === 'object' &&
typeof obj.x === 'number' &&
typeof obj.y === 'number'
```

TypeScript 提供了一连串的基本类型，`string`, `number`, `boolean`, `undefined`, `null`, `symbol` 等等。通过对基本类型进行组合，可以衍生出很多的符合类型，这样可以把多个集合组合到一起，同时命名为其赋予含义，例如衍生的出来的 `Record`, `tuple`, `enum` 等类型。

有了集合，自然就会有交集，并集的概念，就有了 intersection type，union type：

```ts
interface WithName {
	name: string
}

interface WithAge {
	age: number
}

type People = WithName & WithAge

type NumberOrString = string | number
```

### Algebraic Data Type

有一个概念叫 **`Algebraic Data Type`(ADT) 代数类型**。所谓代数类型，就是一种组合类型，a type formed by combining other types.

比较典型的两种组合方式，就是 product types 和 sum types。

- Product types 乘积类型，类似 AxBxC 的组合，它同时包含了 ABC 中的一个值，例如像 record 和 tuple
- Sum types 和类型，类似 A+B+C 的组合，它只包含了 ABC 中的其中某一个值，例如典型的 discriminated union

### Type Narrowing

对于一个大的复杂类型来说，我们经常需要将它逐步进行收缩来确定更细致的类型判断，例如：

```ts
function triple(input: number | string): number | string {
	if (typeof input === 'number') {
		return input * 3
	} else {
		return input.repeat(3)
	}
}
```

TypeScript 提供了丰富的手段来让我们实现 Type Narrowing，例如 typeof 操作符，instanceof 操作符，相等比较，control flow analysis，type predicate 等等。

下面是一个典型的通过使用 discriminated union 来实现的 Type Narrowing：

```ts
type Square = {
	kind: 'square'
	size: number
}


type Rectangle = {
	kind: 'rectangle'
	width: number
	height: number
}

type Circle = {
	kind: 'circle'
	radius: number
}

type Shape = Square | Rectangle | Circle

function area(shape: Shape): number {
	swich (shape.kind) {
		case 'square':
			return shape.size * shape.size
		case 'rectangle':
			return shape.width * shape.height
		case 'circle'
			return Math.Pi * shape.radius * shape.radius
	}
}
```

Shape 合集中都有一个 kind 属性，它的值是一个 string literal，通过在 switch case 中分析针对 kind 的不同取值从而在各个分支中获得具体的类型。

> When every type in a union contains a common property with literal types, TypeScript considers that to be a **discriminated union**, and can narrow out the members of the union.

另外有个小技巧，我们还可以使用 never 类型，来针对 switch 做 exhaustiveness check：

```ts
function area(shape: Shape): number {
	swich (shape.kind) {
		case 'square':
			return shape.size * shape.size
		case 'rectangle':
			return shape.width * shape.height
		case 'circle'
			return Math.Pi * shape.radius * shape.radius
		default:
			const _exhaustiveCheck: never = shape
			return _exhaustiveCheck
	}
}
```

### Subtyping

如果期望类型 T 的实例的任何地方都可以安全的使用类型 S 的实例，那么我们就称 S 是 T 的子类型，这两种类型存在父子关系，更正式的来说，他们不光要满足语法上的正确性，也要满足行为上的正确性，这也叫 Behavioral Subtyping。

上面这个针对子类型的定义规则，就是 Liskov substitution principle 了，也是大名鼎鼎的面向对象 SOLID 原则中的 L。题外话，SOLID 意为：

S - Single-responsiblity Principle
O - Open-closed Principle
L - Liskov Substitution Principle
I - Interface Segregation Principle
D - Dependency Inversion Principle

对于子类型，同样的也会分 nominal vs. structural subtyping。Nominal subtyping 要求必须通过类似 `class Triangle extends Shape` 这样的语法显式的声明一个类型是另一个类型的子类型，而 Structural subtyping
只需要某个类型在结构上包含另外一个类型的所有集合就可以（很明显在 TS 中属于这个，但我们仍然可以通过使用 symbol 来实现前者）

```ts
decalare const TriangleType: unique symbol

class Triangle {
	[TriangleType]: void
}

decalare const ShapeType: unique symbol


class Shape {
	[ShapeType]: void
}

class Triangle2 extends Shape {}

const shouldAcceptAnyShape = (shape: Shape) => {}

shouldAcceptAnyShape(new Triangle()) // Error
shouldAcceptAnyShape(new Triangle2()) // Ok
```

在极端情况下，一个类型可能是其他任何类型的父类型，我们称之为顶层类型，在 TypeScript 中它是 `unknown`，或者一个类型可能是任何类型的子类型，称之为底层类型，在 TS 中，它是 `never`。

### unknown vs any

尽管任何值都可以赋给 unknown 和 any，但在使用这两种类型的变量时，any 可以绕过类型检查，而 unknown 不可以：

```ts
interface User {
	name: string
}

const str = JSON.stringify({ name: 'jack' })

const deserialize = (input: string): unknown => JSON.parse(input)

const greet = (u: user) => console.log(`hello ${u.name}`)

const isUser = (u: any): u is User => u && typeof u.name === 'string'

let usr = deserialize(str)

greet(usr) // Error

if (isUser(usr)) {
	greet(usr) // Ok
}
```

如果一个类型保留其底层类型的父子类型关系，那么就称这个类型具有 covariance 协变性。

例如 `LinkedList<T>` 就具有协变性，因为 `LinkedList<Triangle>` 和 `LinkedList<Shape>` 依然保留了 `Triangle` 和 `Shape` 之间的父子关系。

类似的，底层类型的关系可能会被反转，那么就称这个类型具有 contravariance （逆变性），如果底层类型的关系不确定或者可以被忽视，那么就称为 invariant 不变。


### 类型编程

除了集合操作，我们也可以对类型进行编程运算。为了更方便复用计算逻辑，引入了类型变量，泛型（Generics）。泛型可以理解为一个类型层面的变量，它可以捕获具体调用时的真正类型，同时借助 TS 提供的一些精简的类型操作符，例如keyof，in等，实现类型转换函数

其中比较难的点主要是条件类型，一般形式是 `T extends U ? X : Y` ，和 JavaScript 的三元表达式一致，用来表述非单一形式的类型。

通过条件类型，我们可以让类型系统有更强的表达能力，实现一些之前无法实现的约束，例如没有条件类型的话：

```ts
function process(text: string | null): string | null {
	return text && text.replace('/f/g', 'p')
}

process('foo').toUpperCase() // Error!
```

有了条件类型，则可以通过判断输入来完善如果输入是合法的 string 那么返回也一定是合法的 string 这样的约束。

```ts
function process<T extends string | null>(text: T): T extends string ? string : null {
	return text && text.replace('/f/g', 'p')
}

process('foo').toUpperCase() // Ok
process(null).toUpperCase() // Error
```

条件类型可以嵌套，当 T 类型是合集类型时，条件类型可以进行展开：

```ts
(A | B) extends U ? X : Y ==> (A extends U ? X : Y) | (B extends U ? X : Y)
```

借助条件类型，我们也可以创造出来更多的工具类型，例如 TS 中内置的 Exclude，Extract 等类型。

### Type-level space vs. Value-level space

TS 在变量声明的过程中，构建了另一个平行的类型声明空间。理解两个空间的隔离和联系，才能在各种杂乱的声明中保持清醒。

- 类型在其空间里可以互相引用赋值，但不能当变量用
- 变量在其空间里可以互相引用赋值，但不能当类型用
- 两个空间的声明甚至可以同名

类型空间内同样实现了[图灵完备](https://github.com/Microsoft/TypeScript/issues/14833#issuecomment-536713761)，类型体操完全有能力完成任何类型层面的可计算问题，有人甚至实现了一套类型空间内的[数学表达计算](https://github.com/Microsoft/TypeScript/issues/14833#issuecomment-536713761)。


## Ref

- [Nominal type system](https://en.wikipedia.org/wiki/Nominal_type_system)
- [Structural type system](https://en.wikipedia.org/wiki/Structural_type_system)
- [编程与类型系统- 图书](https://book.douban.com/subject/35325133/)
- [浅谈Typescript（一）：什么是Typescript？ - 知乎](https://zhuanlan.zhihu.com/p/389379296)
- [浅谈TypeScript 类型系统- 知乎](https://zhuanlan.zhihu.com/p/64446259)
- [读懂类型体操：TypeScript 类型元编程基础入门](https://zhuanlan.zhihu.com/p/384172236)

