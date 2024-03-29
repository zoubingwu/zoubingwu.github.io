---
layout: post
title: "Understanding infer in TypeScript"
date: 2022-05-12 23:00:33
tags:
- ts
description: "Usage of infer keyword in TypeScript."
---

TypeScript 中的 `infer` 关键字在一般的应用开发时直接使用的情况可能不多，不过在写一些库的时候，就很可能会需要用到了，而且实际上很多本身内置的类型都是通过它来实现的。它有点像我们平时在 js 里使用的解构赋值，只是作用在类型之上的，另外特别要注意的是它只能在**条件类型**的语句中使用。

条件类型类似 js 里的三元运算符，`(condition ? trueExpression : falseExpression)`：

```ts
type T = SomeType extends OtherType ? TrueType : FalseType;
```

这里的 `extends` 关键字，声明了一种类型约束，它和 `interface A extends B` 或者 `class A extends B` 中的这种表示继承动作的语义很明显是有区别的，但他们确实又有一定的联系，在条件类型中，`T extends K` 意味着我们是否可以安全的认为 `T` 是 `K` 的子类型。

例如，配合 `never` 类型，我们可以用这种约束关系来缩小类型的范围：

```ts
type NullableString = string | null | undefined

type NonNullable<T> = T extends null | undefined ? never : T // Built-in type, FYI

type NonNullableString = NonNullable<NullableString> // evalutes to `string`
```

或者提取出其中一部分类型：

```ts
type Extract<T, U> = T extends U ? T : never;
type Exclude<T, U> = T extends U ? never : T; // they are also built-in types

type Union = 'a' | 'b' | 'c'
type A = Extract<Union, 'a'>
type BC = Exclude<Union, 'a'>
```

对于一个数组类型，可以获取到数组的 item 的类型：

```ts
// `T[number]` 这里用了一个 `Indexed Access Types` 的技巧，来获取到数组的 item 的类型。
type Flatten<T> = T extends any[] ? T[number] : T;

type Str = Flatten<string[]>; // string
type Num = Flatten<number>; // number
```

简单说一下什么是 `Indexed Access Types` 呢，就是直接像访问对象属性一样使用类型，来获取它的某个属性的类型：

```ts
type Person = { age: number; name: string; alive: boolean };
type Age = Person["age"]; // number

// 还可以使用 Union
type I1 = Person["age" | "name"]; // number | string

// 或者利用 keyof
type I2 = Person[keyof Person]; // "age" | "name" | "alive"

// 或者其他类型
type AliveOrName = "alive" | "name";
type I3 = Person[AliveOrName]; // "alive" | "name"
```

再回到我们的条件类型，**先将类型约束到一个具体的类型，然后从中提取出来我们需要部分的类型**，这是一个可以借助条件类型来实现的非常常见的场景，但有的时候可能不存在像上面那样能利用 `Indexed Access Types` 来访问到我们需要的部分的情况，例如获取到函数的参数或者返回类型，为此 ts 提供了一个 `infer` 关键字，有一点像解构赋值一样，我们在需要的部分前加上 `infer` 关键字，就能获取到我们需要的部分类型了将它保存起来使用了：

```ts
type Flatten<T> = T extends Array<infer Item> ? Item : T;
```

通过 `infer` 我们声明了一个新的 `Item` 的泛型，来获取数组的 Item 的类型，就好像我们通过解构赋值来获取数组的 Item 一样。这里有两个需要注意点的事项：

- **`infer` 只能在 Conditional Types 中使用，不能在其他地方使用。**
- **`infer` 获取的类型只能使用在 True 分支上**

例如我们可以用来解决提到的获取函数的返回类型，一个函数的类型一般是这样的，`(...args: any[]) => any`，那么可以有：

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

declare function add(a: number, b: number): number

type A = ReturnType<typeof add>; // number
```

那么获取函数的参数的类型也很简单了：

```ts
type ParamsType<T> = T extends (...args: infer P) => any ? P : any;

type B = ParamsType<typeof add>; // [number, number]
```

也可以获取函数的第一个参数的类型：

```ts
type FirstParamsType<T> = T extends (a: infer P, ...args: any) => any ? P : any;
type C = FirstParamsType<typeof add>; // number
```

对于多个类型签名的，例如重载过的函数，目前 ts 只支持 `infer` 使用最后一个类型来进行推断：

```ts
declare function stringOrNum(x: string): number;
declare function stringOrNum(x: number): string;
declare function stringOrNum(x: string | number): string | number;

type T1 = ReturnType<typeof stringOrNum>; // string | number
```

当然除了函数，`infer` 还可以用在任何对象中，比如：

```ts
interface User {
  id: number;
  name: string;
}

type PropertyType<T> =  T extends { id: infer U, name: infer R } ? [U, R] : T
type P = PropertyType<User> // [number, string]
```

上面我们声明了 U 和 R 两个泛型，最后组合成一个 tuple，那么如果只声明一个泛型，ts 会怎么推断呢？

```ts
type PropertyType<T> =  T extends { id: infer U, name: infer U } ? U : T
type P = PropertyType<User> // number | string
```

在协变位置上，它会返回一个 Union Type。而在逆变位置上，若同一个类型变量存在多个候选者，则最终的类型将被推断为 Intersection Type。

```ts
type Bar<T> = T extends { a: (x: infer U) => void, b: (x: infer U) => void } ? U : never;

type Foo = Bar<{ a: (x: string) => void, b: (x: number) => void }>;  // string & number => never
```

发现了吗，结合利用函数参数类型的逆变性，我们可以通过 Union Type 来转换成 Intersection Type 了！例如我们希望把很多个对象给拼到一起构成一个类型，可以这样：

```ts
// 先转换成一个函数放到参数里，然后求交集
type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer R) => void ? R : never
type A = { a: string }
type B = { b: number }
type T = UnionToIntersection<A | B> // {a: string; b: number}
```

Update 2022-06-08:

TypeScript 4.7 版本推出了一个新的特性，`infer` 现在也支持使用 `extends` constraints 了，例如之前我们需要在使用 `infer` 之后跟一个嵌套的条件类型：

```ts
type FirstIfString<T> =
    T extends [infer S, ...unknown[]]
        ? S extends string ? S : never
        : never;

 // string
type A = FirstIfString<[string, number, number]>;

// never
type D = FirstIfString<[boolean, number, string]>;
```

而现在，可以直接在使用 infer 的地方使用 `extends` 来进一步约束类型了：

```ts
type FirstIfString<T> =
    T extends [infer S extends string, ...unknown[]]
        ? S
        : never;
```
