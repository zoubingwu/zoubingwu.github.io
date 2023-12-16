---
layout: post
title: "typescript and type system"
date: 2021-10-09 16:12:33
tags:
- typescript
description: "concepts in typescript and type system"
---

This blog is an excerpt from a previous presentation given within the company, summarizing some basic concepts of type systems.

## Why do we need type systems

### Distinguishing code from data

At the low-level hardware and machine code level, there is no distinction between program logic and data. However, if the system makes a mistake in distinguishing them, errors can occur. Take the notorious eval function in JavaScript as a less typical example, it is easy to mix up strings and code logic.

```js
console.log(eval("40 + 2")) // OK
console.log(eval("Hello world!")) // Error!
```

### Interpreting data, giving more meaning to types

For machines, types restrict the set of valid values that a variable can accept, while also providing many safety attributes (such as modifiers like private and protected).

For humans, types give a more easily understandable and memorable meaning, making programs more readable and easier to understand by others.

From a logical perspective, adhering to a type system is like a logical proof, providing logical rigor for the correct execution of a program, thus providing assurance for correctness and safety.

For example, for a 16-bit binary sequence in hardware, its meaning can be an unsigned 16-bit integer or a signed 16-bit integer, so the corresponding uint16 and int16 types and their respective value ranges are different.

## Classification of type systems

There is no strict classification criteria for type systems, but from different dimensions and indicators, we can make some rough classifications. For example:

- Strong vs. Weak
- Static vs. Dynamic
- Manifest vs. Inferred
- Nominal vs. Structural

etc., let’s briefly introduce the meanings of each classification.

### Strong vs. Weak

Strong and weak typing mainly describe the strictness of type constraints when implementing them. Weak type systems often implicitly try to convert a value from its actual type to the expected type when using the value, while strong types only do minimal (or even no) implicit type conversion. Like JavaScript, it is obviously weakly typed, a typical example is the double equal sign:

```js
"42" == 42 // true
```

### Static vs. Dynamic

The difference between static and dynamic typing mainly lies in the actual type checking. Dynamic typing defers type checking to runtime, so runtime errors may occur, for example, in JavaScript, if we call a method that does not exist on an object, it will throw an error `Uncaught TypeError: xxx is not a function`. On the other hand, static typing can determine types and perform type checking at compile time, and if there is a mismatch, a compile error will occur.

The main advantage of static typing is that it allows these errors to be discovered at compile time, thereby avoiding runtime issues.

Seeing this, it is natural to understand that a more accurate statement would be that TypeScript is a statically typed language, rather than the commonly mistaken term “strongly typed language”.

### Manifest vs. Inferred

The difference between these two mainly lies in the need for explicit type declarations or the ability to infer types through compiler type inference to reduce active type declarations. For development efficiency and experience, most languages support type inference.

### Nominal vs. Structural

Nominal type systems compare the types themselves and have very strong consistency requirements. Structural type systems compare the shape of type definitions. There is also a concept called Duck typing, I don’t care what it is, as long as it can swim like a duck, walk like a duck, and quack like a duck, then I consider it a duck.

C# uses a Nominal type system:

```csharp
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

TypeScript uses a Structural type system:

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

## TypeScript type system

TS and C# are two programming languages designed by Anders Hejlsberg, and they actually have many similarities. TypeScript was designed as a superset of JavaScript, and naturally had to consider the flexible nature of JS itself. The structural type system in TypeScript is a natural choice.

> One of TypeScript’s core principles is that type checking focuses on the shape that values have. This is sometimes called “duck typing” or “structural subtyping”.

TypeScript only checks the shape, the constraints defined by type definitions, which is very similar to the concept of sets. For example, the type Point can be understood as a kind of set:

```ts
interface Point {
	x: number;
	y: number;
}
```

It corresponds to the type that fulfills the following conditions, which is the Point type:

```js
typeof obj === 'object' &&
typeof obj.x === 'number' &&
typeof obj.y === 'number'
```

TypeScript provides a series of basic types, such as `string`, `number`, `boolean`, `undefined`, `null`, `symbol`, etc. By combining these basic types, many derived types can be created, which allows combining multiple sets and giving them meaningful names, such as the derived types Record, tuple, enum, etc.

With sets, there naturally, will be intersection and union, leading to intersection types and union types:

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

There is a concept called `Algebraic Data Type (ADT)`. ADT is a type formed by combining other types.

Two typical ways of combining types are product types and sum types.

- Product types combine types such as AxBxC, it contains one value from ABC, examples are records and tuples.
- Sum types combine types such as A+B+C, it contains only one value from ABC, a typical example is a discriminated union.

### Type Narrowing

For a large and complex type, we often need to narrow it down step by step to determine more specific type judgments, for example:

```ts
function triple(input: number | string): number | string {
	if (typeof input === 'number') {
		return input * 3
	} else {
		return input.repeat(3)
	}
}
```

TypeScript provides various means to achieve Type Narrowing, such as the typeof operator, the instanceof operator, equality comparison, control flow analysis, and type predicates.

Here is a typical example of Type Narrowing implemented using a discriminated union:

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
	switch (shape.kind) {
		case 'square':
			return shape.size * shape.size
		case 'rectangle':
			return shape.width * shape.height
		case 'circle':
			return Math.Pi * shape.radius * shape.radius
	}
}
```

All types in the union have a common property with literal types. TypeScript considers this to be a discriminated union, and can narrow down the members of the union.

> When every type in a union contains a common property with literal types, TypeScript considers that to be a **discriminated union**, and can narrow out the members of the union.

Another trick we can use is the never type to perform an exhaustiveness check on the switch:

```ts
function area(shape: Shape): number {
	switch (shape.kind) {
		case 'square':
			return shape.size * shape.size
		case 'rectangle':
			return shape.width * shape.height
		case 'circle':
			return Math.Pi * shape.radius * shape.radius
		default:
			const _exhaustiveCheck: never = shape
			return _exhaustiveCheck
	}
}
```

### Subtyping

If an instance of type T can be safely used anywhere an instance of type S is expected, then we say that S is a subtype of T, and there is a parent-child relationship between the two types. More formally, they must not only meet the syntax correctness but also the behavioral correctness, which is also called Behavioral Subtyping.

The definition of subtypes mentioned above is Liskov substitution principle, which is also the L in the well-known SOLID principles in object-oriented programming:

- S - Single-responsibility Principle
- O - Open-closed Principle
- L - Liskov Substitution Principle
- I - Interface Segregation Principle
- D - Dependency Inversion Principle

For subtypes, there are also nominal vs. structural subtyping. Nominal subtyping requires explicit declaration of one type being a subtype of another using syntax like `class Triangle extends Shape`, while structural subtyping only requires one type to structurally contain all the collections of another type (clearly in TS, it belongs to the latter, but we can still achieve the former using symbols).

```ts
decalare const TriangleType: unique symbol
decalare const ShapeType: unique symbol

class Triangle {
	[TriangleType]: void
}

class Shape {
	[ShapeType]: void
}

class Triangle2 extends Shape {}

const shouldAcceptAnyShape = (shape: Shape) => {}

shouldAcceptAnyShape(new Triangle()) // Error
shouldAcceptAnyShape(new Triangle2()) // Ok
```

In extreme cases, a type may be a parent type of any other type, which is called a top-level type. In TypeScript, it is `unknown`. A type may also be a subtype of any other type, which is called a bottom-level type. In TS, it is `never`.

### unknown vs any

Although any value can be assigned to unknown and any, when using variables of these two types, any can bypass type checking, while unknown cannot:

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

If a type retains the parent-child relationship of its underlying type, it is said to have covariance.

For example, `LinkedList<T>` has covariance because `LinkedList<Triangle>` and `LinkedList<Shape>` still maintain the parent-child relationship between `Triangle` and `Shape`.

Similarly, the relationship of the underlying type may be reversed, in that case, it is called contravariance. If the relationship of the underlying type is uncertain or can be ignored, it is called invariance.



### Type Programming

In addition to set operations, we can also perform programming operations on types. To reuse calculation logic more conveniently, type variables and generics are introduced. Generics can be understood as variables at the type level, which can capture the actual type when called, and with the help of the simplified type operators provided by TS, such as keyof, in, etc., type conversion functions can be implemented.

Among them, conditional types are the most difficult, in the general form of `T extends U ? X : Y`, similar to the ternary expression in JavaScript, to describe non-uniform types.

With conditional types, we can give the type system stronger expressive power and achieve some constraints that were previously impossible, such as without conditional types:

```ts
function process(text: string | null): string | null {
	return text && text.replace('/f/g', 'p')
}

process('foo').toUpperCase() // Error!
```

With conditional types, we can improve the constraints by checking if the input is a valid string, and if so, the return is guaranteed to be a valid string:

```ts
function process<T extends string | null>(text: T): T extends string ? string : null {
	return text && text.replace('/f/g', 'p')
}

process('foo').toUpperCase() // Ok
process(null).toUpperCase() // Error
```

Nested conditional types are possible, and when T is a union type, conditional types can be expanded:

```ts
(A | B) extends U ? X : Y ==> (A extends U ? X : Y) | (B extends U ? X : Y)
```

With the help of conditional types, we can create more utility types, such as the built-in Exclude and Extract types in TS.

### Type-level space vs. Value-level space

TS creates another parallel type declaration space during variable declarations. Understanding the isolation and connection between the two spaces helps to stay clear in various messy declarations.

- Types can refer to each other and be assigned to each other in their own space, but cannot be used as variables.
- Variables can refer to each other and be assigned to each other in their own space, but cannot be used as types.
- Declarations in the two spaces can even have the same name.

Types in their own space also achieve [Turing completeness](https://github.com/Microsoft/TypeScript/issues/14833#issuecomment-536713761). Type gymnastics are perfectly capable of solving any computable problems at the type level. Some people have even implemented a [mathematical expression](https://github.com/Microsoft/TypeScript/issues/14833#issuecomment-536713761) calculation in the type space.


## Ref

- [Nominal type system](https://en.wikipedia.org/wiki/Nominal_type_system)
- [Structural type system](https://en.wikipedia.org/wiki/Structural_type_system)
- [编程与类型系统- 图书](https://book.douban.com/subject/35325133/)
- [浅谈Typescript（一）：什么是Typescript？ - 知乎](https://zhuanlan.zhihu.com/p/389379296)
- [浅谈TypeScript 类型系统- 知乎](https://zhuanlan.zhihu.com/p/64446259)
- [读懂类型体操：TypeScript 类型元编程基础入门](https://zhuanlan.zhihu.com/p/384172236)
