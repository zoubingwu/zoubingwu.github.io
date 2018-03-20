---
layout: post
title: "Redux-sage vs Redux-observale"
date: 2018-03-17 22:38:31
tags:
- Rxjs
- Observable 
description: "Redux-sage vs Redux-observale side by side comparison."
---

## 前言

之前工作中一直使用的 redux-sage 来处理非常复杂的异步场景, 在接触到 Rxjs 后马上就被这种编程方式所吸引。它通过使用 observable 序列搭配强大的多种操作符来处理各种异步和事件。

> Think of RxJS as Lodash for events.

这里我们罗列一下常见的场景，来比较一下这两者的写法。

## Metal Model

这两者的模式有着本质的区别：

#### Saga = Worker + Watcher

```js
import API from '...'

function* Watcher(){
    yield takeEvery('do_thing', Worker)
}

function* Worker() { 
    const users = yield API.get('/api/users')
    yield put({type:'done', users})
}
```

#### Rxjs = Epic( Type + Operators )

```js
import API from '...'

const Epic = action$ => 
    action$
        .ofType('do_thing')
        .flatMap(()=>API.get('/api/users'))
        .map(users=>({type:'done', users}))
```


## 场景比较

我们可以从一些最简单的场景开始。

- ### Fetch User from `/api/users/1`

#### Saga:

```js
import axios from 'axios' 

function* watchSaga(){
  yield takeEvery('fetch_user', fetchUser) // waiting for action (fetch_user)
}

function* fetchUser(action){
    try {
        yield put({type:'fetch_user_ing'})
        const response = yield call(axios.get,'/api/users/1')
        yield put({type:'fetch_user_done',user:response.data})
  } catch (error) {
        yield put({type:'fetch_user_error',error})
  }
}
```

#### Rx:

```js
import axios from 'axios'

const fetchUserEpic = action$ => 
    action$
        .ofType('fetch_user')
        .map(()=>({type:'fetch_user_ing'}))
        .flatMap(()=>axios.get('/api/users/1'))
        .map(response=>response.data)
        .map(user=>({type:'fetch_user_done', user}))
```

- ### Fetch User from `/api/users/1` (cancelable)

#### Saga:

```js
import { take, put, call, fork, cancel } from 'redux-saga/effects'
import API from '...'

function* fetchUser() {
    yield put({type:'fetch_user_ing'})
    const user = yield call(API)
    yield put({type:'fetch_user_done', user})  
}

function* Watcher() {
    while(yield take('fetch_user')){
        const bgSyncTask = yield fork(fetchUser)
        yield take('fetch_user_cancel')        
        yield cancel(bgSyncTask)
    }
}
```

#### Rx:

```js
const fetchUserEpic = action$ =>
    actions$
        .ofType('fetch_user')
        .map(()=>({type:'fetch_user_ing'}))
        .flatMap(()=>{
            return Observable
                .ajax
                .get('/api/user/1')
                .map(user => ({ type: 'fetch_user_done', user }))
                .takeUntil(action$.ofType('fetch_user_cancel'))
        })
```

- ### 连续执行序列

#### Saga:

```js
function* worker1() { ... }
function* worker2() { ... }
function* worker3() { ... }

function* watcher() {
  const score1 = yield* worker1()
  yield put(({type:'show_score', score1})

  const score2 = yield* worker2()
  yield put(({type:'show_score', score2})

  const score3 = yield* worker3()
  yield put(({type:'show_score', score3})
}
```

#### Rx:

```js
const score1Epic = action$ =>
    action$
        .ofType('score1')
        .reduce(worker1)
        .flatMap(score=>{
             return Observable.merge(
                {type:'show_score', score},
                {type:'score2'}
             )
         })

const score2Epic = action$ =>
    action$
        .ofType('score2')
        .reduce(worker2)
        .flatMap(score=>{
            return Observable.merge(
                {type:'show_score', score},
                {type:'score3'}
            )
        })

 const score3Epic = action$ =>
    action$
        .ofType('score3')
        .reduce(worker3)
        .map(score=>({type:'show_score', score}))
```

- ### Login, token, Logout, Cancel 

#### with redux

```js
const store = {
    token: null,
    isFetching: false
}

const tokenReducer = (state=null, action) => {
    switch (action.type) {
        case 'login_success':
            return action.token
        case 'login_error':
        case 'login_cancel':
        case 'logout'
            return null
        default:
            return state
    }
}

const isFetching = (state=false, action) => {
    switch (action.type) {
        case 'login_request':
            return true
        case 'login_success':
        case 'login_error':
        case 'login_cancel':
        case 'logout'
            return false
        default:
            return state
    }
}
```

#### Saga

```js
import { take, put, call, fork, cancel } from 'redux-saga/effects'
import Api from '...'

function* loginWatcher() {
    const { user, password } = yield take('login_request')
        , task = yield fork(authorize, user, password)
        , action = yield take(['logout', 'login_error'])
    
    if (action.type === 'logout') {
        yield cancel(task)
        yield put({type:'login_cancel'})
    }
  
}

function* authorize(user, password) {
    try {
        const token = yield call(Api.getUserToken, user, password)
        yield put({type: 'login_success', token})
  } catch (error) {
        yield put({type: 'login_error', error})
  }
}
```

#### Rxjs

```js
const authEpic = action$ => 
    action$
        .ofType('login_request')
        .flatMap(({payload:{user,password}}) =>
            Observable
                .ajax
                .get('/api/userToken', { user, password })
                .map(({token}) => ({ type: 'login_success', token }))
                .takeUntil(action$.ofType('login_cancel', 'logout'))
                .catch(error => Rx.Observable.of({type:'login_error', error}))
```

- ### logger

```js
// ----- Saga ----- \\
while (true) {
    const action = yield take('*')
        , state = yield select()
console.log('action:', action)
console.log('state:', state)
}

// ----- Rxjs ----- \\
.do(value=>console.log(value))
```

- ### Take latest request

```js
// ----- Saga ----- \\
takeLatest()

// ----- Rxjs ----- \\
.switchMap()
```

- ### Retry with delay (1000ms)

```js
// ----- Saga ----- \\

... still thinking about it


// ----- Rxjs ----- \\

.retryWhen(errors=>{
    return errors.delay(1000).scan((errorCount, err)=>{
        if(errorCount < 3) return errorCount + 1
        throw err              
    }, 0)
})
```

- ### Error Handling

```js
// ----- Saga ----- \\
try {
    // ... do things 
} catch (error) {
    yield put({ type:'fetch_user_error',error })
}

// ----- Rxjs ----- \\
.catch(error => Observable.of({ type:'fetch_user_error', error }))
```

- ### 并发执行

```js
// ----- Saga ----- \\
import { call } from 'redux-saga/effects'

const [users, repos]  = yield [
  call(fetch, '/users'),
  call(fetch, '/repos')
]


// ----- Rxjs ----- \\
.flatMap(()=>{
	return Observable.merge(promiseA, promiseB)
})
```

- ### Throttling, Debouncing, Retrying

#### Saga

```js
// ---- Throttling ---- \\

yield throttle(500, 'input_change', fun)

// ---- Debouncing ---- \\

yield call(delay, 500)

// ---- Retrying ---- \\

function* retryAPI(data) {
  for(let i = 0; i < 3; i++) {
    try {
      const apiResponse = yield call(apiRequest, { data });
      return apiResponse;
    } catch(err) {
      if(i < 3) {
        yield call(delay, 2000);
      }
    }
  }
  throw new Error('API request failed');
}
```

#### Rx

```js
// ---- Throttling ---- \\

.throtleTime(1000)

// ---- Debouncing ---- \\

.debouncing(1000)

// ---- Retrying ---- \\

.retry(3)
```

### ref

- [http://reactivex.io/rxjs/manual/overview.html](http://reactivex.io/rxjs/manual/overview.html)

- [Redux-Saga V.S. Redux-Observable](https://hackmd.io/s/H1xLHUQ8e)