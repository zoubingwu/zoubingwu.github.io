---
layout: post
title: "about API mocking"
date: 2022-01-12 20:04:33
tags:
- js
- mock
description: "Elegant API mocking with the service worker."
---

When building a front-end project, you often need to mock an API call yourself in many scenarios:

- in an agile, competitive environment, the backend may be still developing, and you hope to be able to build front-end in parallel
- Or in the development environment, the backend server is quite unstable, and waiting for them to fix it is not an option.
- Most of the front-end issues are related to the data, such as invalid API calls, missing error handling, or something like a text is too long to display and needs to be truncated.
- Sometimes, you want to be able to quickly carry out some experimental development, such as experimenting with a new technology or the prototype implementation of some ideas

Generally speaking, the possible ways include static fixtures, hand-writing code, or some third-party dependencies. For example, create another independent server and pass all the requests to that server. These methods are not particularly ideal.

It needs us to modify the code repeatedly when using the hard-coded state, and introducing a new server will bring new maintenance burdens. Not only do you need to start an additional process on the command line, but also you may need to frequently switch proxy target to forward the request to the correct server endpoint. This indeed works but definitely is not an ideal and smooth development pattern. So is there a perfect way to meet our needs?

There is a library called [msw](https://github.com/mswjs/msw) which did a very good job. It uses the service worker to intercept all requests on the network level to mock every call, and it is very easy to use. You only have to worry about how to define your data, and the rest will be handled by it.

```js
// mock.js
import { setupWorker, rest } from 'msw'

export const worker = setupWorker(
  rest.post('/login', (req, res, ctx) => {
    ctx.json({
      firstName: 'John',
    })
  }),
)

// index.js
if (process.env.NODE_ENV === 'mock') {
  const { worker } = require('./mock')
  worker.start()
}
```

In this way, you don't need to modify any business code to adapt to it. Instead, you only need to inject different environment variables when starting the dev server to achieve seamless use of mock data.

But then writing mock data for every request becomes troublesome work. The shape of mocking data for each API needs to conform to the convention you have with the backend server. Tools like swagger are widely used in the backend to generate documentation as a role of such convention. One of those convention formats is called [OpenAPI](https://swagger.io/specification/). With OpenAPI specification, now we know every request about what kind of data they will need what kind of data they will return.

So instead of hand-writing everything, it is much wiser to take advantage of the existing conventions like OpenAPI. I wrote a simple CLI tool called [msw-auto-mock](https://github.com/zoubingwu/msw-auto-mock) to help us to generate the correct shape of mock data automatically by reading required information from the specification.

```sh
npx msw-auto-mock http://your_openapi.json -o ./mock.js
```

With one command, you can have complete random mock definitions for your API. Then you can use the generated code anywhere you need.

```js
import { startWorker } from './mock';

if (process.env.NODE_ENV === 'development') {
  startWorker();
}
```
