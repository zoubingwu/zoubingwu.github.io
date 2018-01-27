---
layout: post
title: "Redux Optimization"
date: 2018-01-20 10:32:22
tags:
- react
- redux
description: "A short guide about how to optimize react/redux application."
---

## 前言

经常有人会觉得，使用 react/redux 的 web 应用性能会很差。大多数的情况下，这种性能的问题都来源于不必要的重复渲染，因为 DOM 的更新代价是十分昂贵的。

实际上在开发时，尤其是刚接触 React/redux 应用开发时，非常容易犯一些错误而引起这种重复的渲染。

## quick dive into react-redux

我们通常会使用 `connect` 这个高阶组件来使 React 组件订阅 redux store 中的变化，来更新这一组件和它的子组件。在 `react-redux` 中，已经对 `connect` 做了一定的优化，它的完整签名应该是这样子的：

```js
return function connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  {
    pure = true,
    areStatesEqual = strictEqual,
    areOwnPropsEqual = shallowEqual,
    areStatePropsEqual = shallowEqual,
    areMergedPropsEqual = shallowEqual,
    ...extraOptions
  } = {}
) {
  ...
}
```

在我们的实际使用中，大多数情况下我们都只会传入前两个参数，但通过这个签名我们可以更好的理解它内部的逻辑。

所有通过 `connect` 传入的参数，都是用来生成一个对象，然后传入被包裹的组件来作为 props。

`mapStateToProps` 是用来从 redux store 中抽取需要的状态数据来生成一个新的对象；
而 `mapDispatchToProps` 用来生成一个带有函数的对象，通常这些函数都是用来生成 action 的；
默认情况下 `mergeProps` 则把前两个参数生成的 `stateProps`, `dispatchProps` 和组件自己的 `ownProps` 来组合成一个 object，如果你传入了一个函数作为这个参数，那么则会按照你传入的这个函数来组合；
最后这一个参数，类似 `shouldComponentUpdate` 一样，可以按照你指定的选项来确定是否应该 re-render 组件，默认的情况会当作 pureComponent 一样处理。

那什么叫 pure 呢？其实翻一下 react 的文档就可以看到，pureComponent 同普通 react component 的区别就在于默认就引入了 `shouldComponentUpdate` 来进行 shallowEqual 比较 props 和 state。

所谓的 shallow，就是只是循环比较 object 的每个属性，执行[samevaluezero](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)判断，但对于属性内更深的层次，则不会去比较了。例如我们可以看看 lodash 中的 `_.eq` 和 `_.isEqual`：

```js
var object = {
  a: {
    b: 1
  }
}

var other = {
  a: {
    b: 1
  }
}

_.eq(object, other) // false， 虽然这两个对象看上去相同，但他们的 a 属性是不同的引用，指向了不同的 { b: 1 }
_.isEqual(object. other)  // true
```

**因此我们可以得出一个非常重要的结论，那就是只传递给你的组件它需要的数据，否则多传入的冗余的数据的变化，也会引起组件的 re-render，这就造成了性能的浪费。**

依据这一个结论，我们就可以推导出一些基本的原则。

### 分割 connected 的组件

我们有时候会看到这种情况，使用一个大的 container 组件来获取所有的状态，然后通过 props 分发给内部的子组件：

```js
const BigComponent = ({ a, b, c, d }) => (
  <div>
    <ComponentA a={a}/>
    <ComponentB b={b}/>
    <ComponentC c={c}/>
  </div>
)

const connectedBigComponent = connect(
  ({ a, b, c }) => ({ a, b, c })
)(BigComponent)
```

现在，只要是 a，b，c 状态中的任何一个改变，那么整个 `BigComponent`，包括其中的三个子组件，都会 re-render。然而实际上，我们只需要 a 状态改变时，CompopnentA 重新渲染就可以了，b，c 的改变，对它不应该有任何影响。

### 将状态转化为尽可能的小和简单

举个例子，我们有一个很大的列表，比如好几百个：

```js
const List = (props) => (
  <ul>
    {
      props.items.map(({ content, itemId }) => (
        <ListItem
          onClick={onSelectItem}
          content={content}
          itemId={itemId}
          key={itemId}
        />
      ))
    }
  </ul>
)
```

当我们点击其中一个的时候，会发起一个 action 到 store 来更新当前选中是哪一个 - `selectedItem`，每一个 ListItem 会 connect 到 store 来获取这个 `selectedItem`：

```js
const ListItem = connect(
  ({ selectedItem }) => ({ selectedItem })
)(SimpleListItem)
```

注意我们之前说的上一条原则，这里如果我们 connect 的是 List 这个组件，那么 `selectedItem` 改变的时候整个组件以及几百个子组件都会更新，这显然不是我们想要的。所以我们需要 connect 单独的每一个子组件。

但是如果像上面的代码一样直接把 `selectedItem` 的值传入，所有的子组件可能还是会更新一遍，因为 props 可能从 `{ selectedItem: 100 }` 变成了 `{ selectedItem: 200 }`，而我们实际上只需要根据 id 来检查当前的是否被选中，因此我们最好转化为：

```js
const ListItem = connect(
  ({ selectedItem }, { itemId }) => ({ isSelected: selectedItem === itemId })
)(SimpleListItem);
``` 

这样，每当 `selectedItem` 的值改变时，只有两个 ListItem 会被重新渲染。

### 扁平化的数据结构

这一点其实在[ Redux 文档](https://redux.js.org/docs/recipes/reducers/NormalizingStateShape.html)中有比较详细的说明。

#### ref

- [https://redux.js.org/](https://redux.js.org/)

- [https://reactrocket.com/post/react-redux-optimization/](https://reactrocket.com/post/react-redux-optimization/)
