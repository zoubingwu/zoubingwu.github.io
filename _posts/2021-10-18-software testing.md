---
layout: post
title: "software testing"
date: 2021-10-18 18:04:33
tags:
- test
description: "Software testing concepts and tools in JavaScript"
---

软件测试涉及到的东西太多了，简单记录一些常见的概念以及聊聊 JS 生态中一些常见的工具。

## Testing approach

### Static, dynamic, passive testing

静态测试通常是隐式的，典型的比如 code review, walkthrough, 或者通过编程工具，编辑器检查源代码结构，或者通过编译器来检查语法和数据流时进行静态程序分析。

而动态测试在成本身运行的时候进行，例如通过编写一系列的测试用例来执行程序并验证结果。

被动测试则意味着不与软件产品进行任何交互的情况下验证系统行为。与主动测试不同的是，测试人员不提供任何测试数据，而是通过查看系统日志进行追踪。 

### Box approach(White-box testing, Black-box testing, Grey-box testing)

软件测试方法传统上分为白盒测试和黑盒测试，主要用于描述测试人员在设计测试用例时的思路。当然也有一种混合的灰盒测试方式目前也越来越多。

白盒测试（也称为透明盒测试、玻璃盒测试、透明盒测试和结构测试）验证程序的内部结构或工作方式，而不是向最终用户公开的功能。在白盒测试中，系统（源代码）的内部视角以及编程技能被用于设计测试用例。测试人员选择输入以通过代码执行路径并确定适当的输出。

虽然白盒测试可以应用于软件测试过程的单元、集成和系统级别，但它通常是在单元级别完成的。它可以测试单元内的路径、集成期间单元之间的路径以及系统级测试期间子系统之间的路径。尽管这种测试设计方法可以发现许多错误或问题，但它可能无法检测到规范中未实现的部分或缺失的需求。

白盒测试中使用的技术包括：

- API 测试– 使用公共和私有API（应用程序编程接口）测试应用程序
- 代码覆盖率——创建测试以满足代码覆盖率的一些标准（例如，测试设计者可以创建测试使程序中的所有语句至少执行一次）
- 故障注入方法——故意引入故障来衡量测试策略的有效性

黑盒测试（也称为功能测试）将软件视为“黑盒”，在不了解内部实现的情况下检查功能，也无需查看源代码。测试人员只知道软件应该做什么，而不知道它是如何做的。基于规范的测试旨在根据适用的要求测试软件的功能。这种级别的测试通常需要向测试人员提供全面的测试用例，然后测试人员可以简单地验证对于给定的输入、输出值（或行为），“是”或“不是”与测试用例中指定的期望值。试用例是围绕规范和需求构建的，即应用程序应该做什么。它使用软件的外部描述，包括规范、需求和设计来派生测试用例。这些测试可以是功能性或无功能，虽然平时的功能。

灰盒测试包括了解内部数据结构和算法，以便在用户或黑盒级别执行这些测试时设计测试。测试人员通常可以访问“源代码和可执行二进制文件”。也可能包括逆向工程（使用动态代码分析）来确定，例如，边界值或错误消息。

## Testing levels

从广义上讲，至少有三个级别的测试：单元测试、集成测试和系统测试。但是，开发人员可能会包括第四个级别，即验收测试。

### Unit testing

单元测试是指验证特定代码部分的功能的测试，通常在功能级别。在面向对象的环境中，这通常是在类级别，最少的单元测试包括构造函数和析构函数。

这些类型的测试通常由开发人员在处理代码时编写（白盒风格），以确保特定功能按预期工作。一个函数可能有多个测试，以捕获代码中的极端情况或其他分支。单独的单元测试不能验证一个软件的功能，而是用来确保软件的构建块彼此独立地工作。

单元测试是一个软件开发过程，它涉及广泛的缺陷预防和检测策略的同步应用，以减少软件开发风险、时间和成本。它由软件开发人员或工程师在软件开发生命周期的构建阶段执行。单元测试的目的是在代码被提升到额外的测试之前消除构建错误；该策略旨在提高最终软件的质量以及整个开发过程的效率。

根据组织对软件开发的期望，单元测试可能包括静态代码分析、数据流分析、度量分析、同行代码审查、代码覆盖分析和其他软件测试实践。

### Integration testing

集成测试是任何类型的软件测试，旨在根据软件设计验证组件之间的接口。软件组件可以以迭代方式集成或全部集成在一起（“大爆炸”）。通常前者被认为是更好的做法，因为它允许更快地定位和修复界面问题。

集成测试用于暴露集成组件（模块）之间的接口和交互中的缺陷。与架构设计元素相对应的越来越多的测试软件组件组被集成和测试，直到软件作为一个系统工作。

集成测试通常涉及大量代码，并且产生的痕迹比单元测试产生的痕迹大。当集成测试失败时，这会影响定位故障的容易程度。为了克服这个问题，有人建议将大测试自动切割成小块，以改进故障定位。

### System testing

系统测试测试一个完全集成的系统，以验证系统是否满足其要求。例如，系统测试可能涉及测试登录界面，然后创建和编辑条目，加上发送或打印结果，然后对条目进行汇总处理或删除（或归档），然后注销

### Acceptance testing

通常这种级别的验收测试包括以下四种类型：

- 用户验收测试
- 操作验收测试
- 合同和监管验收测试
- Alpha 和 Beta 测试

操作验收用于进行产品、服务或系统的操作准备（预发布），作为质量管理体系的一部分。

## Testing tools in JavaScript

### [ava](https://github.com/avajs/ava)

ava 是一个专注于 Node.js 环境的测试工具。支持按文件的环境隔离，并发运行，支持 async 函数，Observable 等异步原语。它提供了非常棒的结果结果输出，清晰的错误栈等丰富的特性。

一个典型的 ava 测试是这样的：

```js
const test = require('ava');

test('foo', t => {
	t.pass();
});

test('bar', async t => {
	const bar = Promise.resolve('bar');
	t.is(await bar, 'bar');
});
```

如果是专注于 Node 环境的代码进行测试的话是不错的选择。

### [Jest](https://jestjs.io/)

Jest 是一个大一统的完善测试环境，不光是 Node 环境，也支持浏览器，对 React， Vue， Angular 等各种各样的框架也有良好的支持。

几乎所有的相关功能都已经内置好了，例如断言，异步支持，各种 hook 等。

```js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

对于测试像 React 组件这样的需求来说，可以使用 Enzyme 这样的工具，不过更推荐的是吗 `@testing-library/react`。这个库是 Enzyme 的替代品。

React Testing Library 是一个用于测试 React 组件的轻量级解决方案。它主要指导原则是： **您的测试与您的软件使用方式越相似，它们就可以给您越多的信心。**

```js
// __tests__/fetch.test.js
import React from 'react'
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import Fetch from '../fetch'

const server = setupServer(
  rest.get('/greeting', (req, res, ctx) => {
    return res(ctx.json({greeting: 'hello there'}))
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('loads and displays greeting', async () => {
  render(<Fetch url="/greeting" />)

  fireEvent.click(screen.getByText('Load Greeting'))

  await waitFor(() => screen.getByRole('heading'))

  expect(screen.getByRole('heading')).toHaveTextContent('hello there')
  expect(screen.getByRole('button')).toBeDisabled()
})

test('handles server error', async () => {
  server.use(
    rest.get('/greeting', (req, res, ctx) => {
      return res(ctx.status(500))
    }),
  )

  render(<Fetch url="/greeting" />)

  fireEvent.click(screen.getByText('Load Greeting'))

  await waitFor(() => screen.getByRole('alert'))

  expect(screen.getByRole('alert')).toHaveTextContent('Oops, failed to fetch!')
  expect(screen.getByRole('button')).not.toBeDisabled()
})
```

### [Mocha](https://mochajs.org/)

Mocha 主要提供了运行测试，输出结果的测试运行环境，支持并行串行等，但需要自行选择一个断言库，例如可以使用 Node 内置的 assert 模块，或者 `should.js`, `expect.js` 等。

如果是新开的项目建议就别用了。

```js
const assert = require('assert');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});
```

### [Cypress](https://www.cypress.io/)

Cypress 主要是用来做一些端到端的集成测试，经常被用来和 Selenium 这样的工具来比较，不过它也可以用来做一些单元测试。它不光提供了运行测试，还提供了一个 dashboard 来记录测试。

对于一些单元测试，它写法和主流的测试框架都是差不多的。

```js
describe('My First Test', () => {
  it('Does not do much!', () => {
    expect(true).to.equal(true)
  })
})
```

同时它可以打开本地机器安装的浏览器，通过访问 DOM 来运行一些真实场景的测试。

```js
describe('My First Test', () => {
  it('Gets, types and asserts', () => {
    cy.visit('https://example.cypress.io')

    cy.contains('type').click()

    // Should be on a new URL which includes '/commands/actions'
    cy.url().should('include', '/commands/actions')

    // Get an input, type into it and verify that the value has been updated
    cy.get('.action-email')
      .type('fake@email.com')
      .should('have.value', 'fake@email.com')
  })
})
```

### [Jasmine](https://jasmine.github.io/)

Jasmine 也是一个比较老的测试框架了，说实话文档做的比较一般。

```js
describe("A suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });
});

describe("A suite is just a function", function() {
  var a;

  it("and so is a spec", function() {
    a = true;

    expect(a).toBe(true);
  });
});

describe("A suite with some shared setup", function() {
  var foo = 0;

	beforeEach(function() {
    foo += 1;
  });

  afterEach(function() {
    foo = 0;
  });

  beforeAll(function() {
    foo = 1;
  });

  afterAll(function() {
    foo = 0;
  });
});
```

### [Karma](https://karma-runner.github.io/)

Karma 是由 AngularJS 团队创建的，也有一些年头了，说实话我个人是感觉跟他们品味不太对路子的，同时文档也有点一言难尽，建议开新坑就别用了。

### [Puppeteer](https://developers.google.com/web/tools/puppeteer) & [Playwright](https://playwright.dev/)

这俩放到一起吧，他们都是为了实现浏览器的自动化测试而创建的，在上古时代就有 [Selenium](https://www.selenium.dev/) 这样的工具了。当然，除了测试以外，你还可以实现一些例如爬虫，截图等等之类的功能。

因为 Selenium 例如资源消耗，稳定性等等本身各种各样的问题，开始出现了 PhantomJS 这样的无头浏览器，它可以完成绝大多数浏览器的功能，只是不执行渲染 UI 的功能而已。

对于简单的网站来说，无头浏览器已经够用了，不过对于复杂的网站，需要通过支持各种 Web 标准来尽可能接近地模拟完整的浏览器。然而，由于浏览器的复杂性，全面支持几乎是不可能完成的任务。

于是 2017 年谷歌发布了 headless chrome，Firefox 过些时候也跟进了无头模式。

之后谷歌进一步发布了 Puppeteer，提供了一系列 API 来方便驱动 headless chrome，可以轻松开始浏览器自动化。Selenium 使用 WebDriver 协议，它需要运行一个服务器作为 Selenium 和浏览器之间的中介。例如，有ChromeDriver、geckodriver（用于 Firefox）和safaridriver。这种对特殊服务器的要求增加了复杂性。相比之下，Puppeteer 使用非标准DevTools 协议控制 Chrome ，因此它直接与浏览器对话并通过 Selenium 提供额外功能，例如拦截网络请求。

2020 年，微软发布了 Playwright 的第一个公开版本，实际上它的贡献者也主要来自 Puppeteer。因此，Playwright 在很多方面与 Puppeteer 非常相似。API 方法在大多数情况下是相同的，并且 Playwright 默认还捆绑了兼容的浏览器。

Playwright 最大的不同点是跨浏览器支持。它可以驱动 Chromium、WebKit（Safari 的浏览器引擎）和 Firefox。

不过，Playwright 团队的跨浏览器支持方法是[有争议的](https://twitter.com/gsnedders/status/1220331113777967105)。他们主要通过为 WebKit 和 Firefox 打补丁实现的（虽然声称只修改了 WebKit 和 Firefox 调试协议，而不是实际的渲染引擎）。这种方式没有和 WebKit 和 Firefox 团队进行沟通，就擅自开启了一个新的分支，虽然未来有可能合并，但也有可能不得不长期地维护这些更改，从而在影响 Playwright 跨浏览器支持的长期可靠性。

如果你的程序需要针对跨浏览器来进行测试的话，可以优先考虑 Playwright。
