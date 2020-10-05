---
layout: post
title: "building a calendar app (2)"
date: 2020-10-03 23:43:22
tags:
  - calendar
  - webdav
  - caldav
description: "building a calendar app part II."
---

## WebDAV and CalDAV

前文主要简单介绍了一些相关的概念，其中最重要的就是 WebDAV 和 CalDAV 协议，这两者是基于 HTTP 的扩展协议。实际上要自己开发一个日历应用，也可以完全不遵循这些协议，自己进行抽象建模，再考虑提供符合协议的开放接口，但遵循这些相关的协议，可以让用户再同一个应用内接入所有符合这些协议的数据来源，例如 Apple Calendar 或者 Google Calendar。下面就具体讲讲基于 CalDAV 协议来进行服务端和客户端的数据交换。

## 一些前提

CalDAV 协议的主要的数据格式使用的是 XML，其中日历的详细信息（位于 XML 中的某个字段）则使用 iCalendar 格式。

WebDAV 是对 HTTP 进行的一层扩展，而 CalDAV 基于 WebDAV 再次进行针对日历的扩展，相比于常见的 PUT GET POST 等方法，增加了许多如 PROPFIND REPORT 等方法。通常来说一些常用的 HTTP Client 都是支持这些方法的（例如浏览器环境内的 XMLHttpRequest）。

WebDAV/CalDAV 协议使用中心化的服务器存储数据，因此服务器上的数据永远正确的，如果客户端上发生冲突，都以服务器的数据为准。

日历中的所有任务，事件等等信息，都使用 iCalendar 格式编码，客户端最好始终保存好这些原始数据。

协议本身允许开发者增加一些非标准字段，当然在使用这些字段的时候需要注意针对处理。

## 同步日历数据

客户端需要获取日历数据，就需要考虑两个问题，一个是身份鉴权，第二个就是接口路由，身份鉴权的问题可以使用任意的方式，协议本身不做任何限制。

获取接口路由，除了由客户端硬编码指定以外，实际上协议定义了一个可选的服务发现方式。

### 服务发现

根据 [RFC5785](https://tools.ietf.org/html/rfc5785)，可以使用 `.well-known` 这一路径来跳转到对应的服务：

```
http://dav.example.org/.well-known/caldav -> root of your dav server
http://dav.example.org/.well-known/carddav -> root of your dav server
```

客户端可以直接像上面这样的接口发起请求，服务器会返回一个 302 跳转，告诉客户端真正的服务地址。

也可以通过修改 DNS 配置的方式来达到同样的目的，这就需要用到 [SRV Record](https://en.wikipedia.org/wiki/SRV_record)。

在获取日历服务对应的根路由后，为了方便获取一个账号内所有的日历，可以继续后续的发现逻辑。

假设日历服务的根路由位于 `https://dav.example.org/`, 客户端可以首先向这个 URL 发起一个 PROPFIND 请求：

```xml
PROPFIND / HTTP/1.1
Depth: 0
Prefer: return-minimal
Content-Type: application/xml; charset=utf-8

<d:propfind xmlns:d="DAV:">
  <d:prop>
     <d:current-user-principal />
  </d:prop>
</d:propfind>
```

其中 `principal` 这个概念，对应着一个用户（可能是一个自然人，一个组织等等），服务器会返回如下的响应：


```xml
HTTP/1.1 207 Multi-status
Content-Type: application/xml; charset=utf-8

<d:multistatus xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
    <d:response>
        <d:href>/</d:href>
        <d:propstat>
            <d:prop>
                <d:current-user-principal>
                    <d:href>/principals/users/johndoe/</d:href>
                </d:current-user-principal>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>
```

其中 `/principals/users/johndoe/` 这个 URL 就对应了 johndoe 这个用户，可以继续通过这个 URL 发起请求来获取该用户的所有日历的合集：

```xml
PROPFIND /principals/users/johndoe/ HTTP/1.1
Depth: 0
Prefer: return-minimal
Content-Type: application/xml; charset=utf-8

<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
     <c:calendar-home-set />
  </d:prop>
</d:propfind>
```

`calendar-home-set` 就是包含用户所有日历的一个容器，称之为 calendar home。

服务器会返回如下响应：

```xml
HTTP/1.1 207 Multi-status
Content-Type: application/xml; charset=utf-8

<d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
    <d:response>
        <d:href>/principals/users/johndoe/</d:href>
        <d:propstat>
            <d:prop>
                <c:calendar-home-set>
                    <d:href>/calendars/johndoe/</d:href>
                </c:calendar-home-set>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>
```

可以看到 `/calendars/johndoe/` 这个 URL 就对应了 johndoe 这个用户的 calendar home。

终于，现在可以发起一个请求来列出所有的日历：

```xml
PROPFIND /calendars/johndoe/ HTTP/1.1
Depth: 1
Prefer: return-minimal
Content-Type: application/xml; charset=utf-8

<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
     <d:resourcetype />
     <d:displayname />
     <cs:getctag />
     <c:supported-calendar-component-set />
  </d:prop>
</d:propfind>
```

在这个请求，我们尝试获取日历的四个属性：

1. resourcetype 资源类型，对于日历的话，需要包含一个 `calendar` 类型。
2. displayname 日历显示的名称
3. getctag 即日历的 `ctag`
4. supported-calendar-component-set 该日历支持哪些组件，例如 VTODO VEVENT 等

服务器可能返回下面这样的响应：

```xml
HTTP/1.1 207 Multi-status
Content-Type: application/xml; charset=utf-8

<d:multistatus xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/" xmlns:c="urn:ietf:params:xml:ns:caldav">
    <d:response>
        <d:href>/calendars/johndoe/</d:href>
        <d:propstat>
            <d:prop>
                <d:resourcetype>
                    <d:collection/>
                </d:resourcetype>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
    <d:response>
        <d:href>/calendars/johndoe/home/</d:href>
        <d:propstat>
            <d:prop>
                <d:resourcetype>
                    <d:collection/>
                    <c:calendar/>
                </d:resourcetype>
                <d:displayname>Home calendar</d:displayname>
                <cs:getctag>3145</cs:getctag>
                <c:supported-calendar-component-set>
                    <c:comp name="VEVENT" />
                </c:supported-calendar-component-set>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
    <d:response>
        <d:href>/calendars/johndoe/tasks/</d:href>
        <d:propstat>
            <d:prop>
                <d:resourcetype>
                    <d:collection/>
                    <c:calendar/>
                </d:resourcetype>
                <d:displayname>My TODO list</d:displayname>
                <cs:getctag>3345</cs:getctag>
                <c:supported-calendar-component-set>
                    <c:comp name="VTODO" />
                </c:supported-calendar-component-set>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>
```

### 获取数据

在完成上面的服务发现过程后，我们已经拿到了日历对应的 URL，即上面的只支持 VEVENT 的 `/calendars/johndoe/home/` 和只支持 VTODO 的 `/calendars/johndoe/tasks/`。

每一个日历都有一个叫做 `ctag` 的标识符，如果 `ctag` 变化了，那么就意味着日历被修改了。

客户端做的第一件事，是获取日历 `ctag` 和其他相关属性：

```xml
PROPFIND /calendars/johndoe/home/ HTTP/1.1
Depth: 0
Prefer: return-minimal
Content-Type: application/xml; charset=utf-8

<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
  <d:prop>
     <d:displayname />
     <cs:getctag />
  </d:prop>
</d:propfind>
```

这里我们通过 PROPFIND 方法去尝试获取日历的 `displayname` 和 `ctag` 属性。服务器会返回一个 207 的响应：

```xml
HTTP/1.1 207 Multi-status
Content-Type: application/xml; charset=utf-8

<d:multistatus xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
    <d:response>
        <d:href>/calendars/johndoe/home/</d:href>
        <d:propstat>
            <d:prop>
                <d:displayname>Home calendar</d:displayname>
                <cs:getctag>3145</cs:getctag>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>
```

在获取到 `ctag` 以后客户端可以和本地的数据进行比较以决定要不要去拉取完整的日历数据。如果需要的话，则发起一个 REPORT 请求：

```xml
REPORT /calendars/johndoe/home/ HTTP/1.1
Depth: 1
Prefer: return-minimal
Content-Type: application/xml; charset=utf-8

<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
    <d:prop>
        <d:getetag />
        <c:calendar-data />
    </d:prop>
    <c:filter>
        <c:comp-filter name="VCALENDAR" />
    </c:filter>
</c:calendar-query>
```

这个请求意味着客户端希望获取完整的 VCALENDAR 数据和它对应的 etag，同时这里也可以使用 filter 来根据时间范围或者事件类型等各种条件进行筛选，例如只对 VTODO 感兴趣：

```xml
<c:comp-filter name="VCALENDAR">
    <c:comp-filter name="VTODO" />
</c:comp-filter>
```

同样的，服务器会再次返回一个 207 响应：

```xml
HTTP/1.1 207 Multi-status
Content-Type: application/xml; charset=utf-8

<d:multistatus xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
    <d:response>
        <d:href>/calendars/johndoe/home/132456762153245.ics</d:href>
        <d:propstat>
            <d:prop>
                <d:getetag>"2134-314"</d:getetag>
                <c:calendar-data>BEGIN:VCALENDAR
                    VERSION:2.0
                    CALSCALE:GREGORIAN
                    BEGIN:VTODO
                    UID:132456762153245
                    SUMMARY:Do the dishes
                    DUE:20121028T115600Z
                    END:VTODO
                    END:VCALENDAR
                </c:calendar-data>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
    <d:response>
        <d:href>/calendars/johndoe/home/132456-34365.ics</d:href>
        <d:propstat>
            <d:prop>
                <d:getetag>"5467-323"</d:getetag>
                <c:calendar-data>BEGIN:VCALENDAR
                    VERSION:2.0
                    CALSCALE:GREGORIAN
                    BEGIN:VEVENT
                    UID:132456-34365
                    SUMMARY:Weekly meeting
                    DTSTART:20120101T120000
                    DURATION:PT1H
                    RRULE:FREQ=WEEKLY
                    END:VEVENT
                    END:VCALENDAR
                </c:calendar-data>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
```

上面这个响应包含了两个对象，一个 TODO 和一个每周重复的事件，每个对象由三个部分组成：

1. iCalendar 格式的事件数据本身
2. url
3. etag

客户端需要将其全部存储起来。

### 数据发生变化

当数据发生变化后，为了保证数据的同步，客户端需要再次请求 `ctag`，拿到以后如果发生了变化，由于一个日历内的事件数量可能非常多，事件本身也可能是一个非常大的对象，因此这里不能直接请求拉取所有的事件，而是要先去请求所有事件的 `etag` 和本地的数据进行比较，找出变化的部分，再去请求具体的事件数据。

要获取变化的数据，可以直接针对事件的 URL 发起一次 GET 请求：

```
GET /calendars/johndoe/home/132456762153245.ics HTTP/1.1
```

当然，也可以在一个请求内进行批量的拉取：

```xml
REPORT /calendars/johndoe/home/ HTTP/1.1
Depth: 1
Prefer: return-minimal
Content-Type: application/xml; charset=utf-8

<c:calendar-multiget xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
    <d:prop>
        <d:getetag />
        <c:calendar-data />
    </d:prop>
    <d:href>/calendars/johndoe/home/132456762153245.ics</d:href>
    <d:href>/calendars/johndoe/home/fancy-caldav-client-1234253678.ics</d:href>
</c:calendar-multiget>
```

### 更新数据

要更新日历内的某个事件，需要客户端上构造好新的 iCalendar 格式数据，然后发起一次 PUT 请求：

```xml
PUT /calendars/johndoe/home/132456762153245.ics HTTP/1.1
Content-Type: text/calendar; charset=utf-8
If-Match: "2134-314"

BEGIN:VCALENDAR
....
END:VCALENDAR
```

成功后则服务端会返回一个新的 `etag`：

```
HTTP/1.1 204 No Content
ETag: "2134-315"
```

### 创建数据

要创建事件的话，也是类似的，但客户端没有一个现成的 URL，可以由端上自行构造：

```
PUT /calendars/johndoe/home/somerandomstring.ics HTTP/1.1
Content-Type: text/calendar; charset=utf-8

BEGIN:VCALENDAR
....
END:VCALENDAR
```

成功后服务端会返回一个 201 响应：

```
HTTP/1.1 201 Created
ETag: "21345-324"
```

### 删除数据

删除操作可以直接发起 DELETE 请求：

```
DELETE /calendars/johndoe/home/132456762153245.ics HTTP/1.1
If-Match: "2134-314"
```


## WebDAV-Sync

对于上面的 CalDAV 协议制定的流程，不难发现同步数据是一件非常麻烦的事情，因此后来又有了 [RFC6578](https://tools.ietf.org/html/rfc6578) 来简化同步的流程：

1. 首先客户端向服务端请求一个 sync-token

```xml
PROPFIND /calendars/johndoe/home/ HTTP/1.1
Depth: 0
Content-Type: application/xml; charset=utf-8

<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
  <d:prop>
     <d:displayname />
     <cs:getctag />
     <d:sync-token />
  </d:prop>
</d:propfind>
```

2. 服务端返回了 sync-token （下面的例子里 sync token 是一个 URL，但这个 URL 不代表任何意义，也可以使用使用一个随机的字符串）

```xml
<d:multistatus xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
    <d:response>
        <d:href>/calendars/johndoe/home/</d:href>
        <d:propstat>
            <d:prop>
                <d:displayname>My calendar</d:displayname>
                <cs:getctag>3145</cs:getctag>
                <d:sync-token>http://sabredav.org/ns/sync-token/3145</d:sync-token>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>
```

3. 一段时间过去了

4. 客户端向服务器发起一个希望同步数据的请求，并把这个 sync-token 提交上去

```xml
REPORT /calendars/johndoe/home/ HTTP/1.1
Host: dav.example.org
Content-Type: application/xml; charset="utf-8"

<?xml version="1.0" encoding="utf-8" ?>
<d:sync-collection xmlns:d="DAV:">
  <d:sync-token>http://sabredav.org/ns/sync/3145</d:sync-token>
  <d:sync-level>1</d:sync-level>
  <d:prop>
    <d:getetag/>
  </d:prop>
</d:sync-collection>
```

5. 服务端返回从这个 sync-token 到现在所有变化过的数据，和一个新的 sync-token 交给客户端

```xml
HTTP/1.1 207 Multi-Status
Content-Type: application/xml; charset="utf-8"

<?xml version="1.0" encoding="utf-8" ?>
<d:multistatus xmlns:d="DAV:">
    <d:response>
        <d:href>/calendars/johndoe/home/newevent.ics</d:href>
        <d:propstat>
            <d:prop>
                <d:getetag>"33441-34321"</d:getetag>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
    <d:response>
        <d:href>/calendars/johndoe/home/updatedevent.ics</d:href>
        <d:propstat>
            <d:prop>
                <d:getetag>"33541-34696"</d:getetag>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
    <d:response>
        <d:href>/calendars/johndoe/home/deletedevent.ics</d:href>
        <d:status>HTTP/1.1 404 Not Found</d:status>
    </d:response>
    <d:sync-token>http://sabredav.org/ns/sync/5001</d:sync-token>
 </d:multistatus>
```

这个返回里包含了三个事件的变化，客户端可以根据 status 字段来分别进行处理，例如 404 则意味着客户端本地需要删除 `/calendars/johndoe/home/deletedevent.ics` 这个事件。

## 相关工具

由于协议基于 XML 进行数据交换，因此需要客户端有解析 XML 的能力，对于浏览器，天生就提供了这样的能力，可以使用 [`DOMParser`](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) 这一接口来进行解析。

对于解析 iCalendar 格式的日历数据，可以使用 mozilla 开发的 [ical.js](https://github.com/mozilla-comm/ical.js/)

为了减少构造请求的成本，也有很多的开源 CalDAV Client 可以使用，例如 [cdav-library](https://github.com/nextcloud/cdav-library) ，[dav](https://www.npmjs.com/package/dav) 等。

当然上面的工具可能都有一些缺陷或者不满足需求的地方，可以在必要的时候自行封装设计一些轮子。

## 冲突事件

在 UI 上，事件通常使用矩形展示，对于在同一日内的事件，可能会存在时间上有冲突的情况，这个时候需要对矩形进行一些变换，使得用户能够清晰的查看不同事件的安排，像 outlook 日历，google 日历，飞书等，都使用了一些策略来进行调整。下面给出一个简单的思路，实现 outlook 那样将事件平铺展示的算法。

将事件平铺展示，意味着当两个事件起始时间都相同时，他们并排展示，平分所在的空间。

事件往往有一个开始时间和结束时间，因此冲突事件的展示，本质是一个区间问题。所谓区间问题，就是线段问题，涉及到线段，主要有两点要注意：

1. 排序，常见的的排序方法就是按区间的起点升序。
2. 尽量画出来，可以很直观的看到各种情况。

我们首先将事件按照起点升序来进行排序，如果起点相同，则按照终点降序（Why？ 后面再说）。

接下来可以按照人脑的排列方式去思考，先把所有不相交的事件按时间升序排上去。

```
===========

░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░

░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░

░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░

░░░░░░░░░░░
░░░░░░░░░░░
░░░░░░░░░░░

===========
```

接下来，把剩下的事件中互不冲突的作为第二列排上去，两列平分宽度：

```
===========

░░░░░░
░░░░░░
░░░░░░

░░░░░░██████
░░░░░░██████
░░░░░░██████
░░░░░░██████
░░░░░░
░░░░░░
░░░░░░██████
░░░░░░██████
░░░░░░██████
      ██████
░░░░░░██████
░░░░░░
░░░░░░██████
      ██████
░░░░░░██████
░░░░░░██████
░░░░░░██████
      ██████
      ██████
      ██████
===========
```

从这里就能理解为什么如果起点相同，则按照终点降序，因为我们希望更长的那个事件能够被优先排列上去。

重复这个过程直到所有的事件都排列完成。

最后检查每个事件有被几列相交，调整其宽度：

```
===========

░░░░░░░░░░░░
░░░░░░░░░░░░
░░░░░░░░░░░░

░░░░░░██████
░░░░░░██████
░░░░░░██████
░░░░░░██████
░░░░░░
░░░░░░
░░░░░░██████
░░░░░░██████
░░░░░░██████
      ██████
░░░░░░██████
░░░░░░
░░░░░░██████
      ██████
░░░░░░██████
░░░░░░██████
░░░░░░██████
      ██████
      ██████
      ██████
===========
```

具体代码可以查看 [Codesandbox](https://codesandbox.io/s/goofy-feather-lwdh8?file=/src/App.js)


## reference

- [https://sabre.io/dav/building-a-caldav-client/](https://sabre.io/dav/building-a-caldav-client/)
- [https://tools.ietf.org/html/rfc5785](https://tools.ietf.org/html/rfc5785)
- [https://tools.ietf.org/html/rfc6578](https://tools.ietf.org/html/rfc6578)
- [https://github.com/nextcloud/cdav-library](https://github.com/nextcloud/cdav-library)
- [https://github.com/lambdabaa/dav](https://github.com/lambdabaa/dav)