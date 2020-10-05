---
layout: post
title: "building a calendar app (1)"
date: 2020-08-20 13:43:22
tags:
  - calendar
  - webdav
  - caldav
description: "some concepts you should know to build a calendar app."
---

日历，待办，通讯录等是在互联网诞生之前就已经存在的工具，随着互联网的诞生，跨越距离限制的远程协作使得多人间分享和同步这些数据信息成为了一大需求。这篇文章主要介绍一些开发日历这样的协作工具的相关概念。

## Exchange ActiveSync

微软推出的用以同步服务器与终端设备的邮件，通讯录，日历，待办，笔记等信息的私有协议。该协议基于 XML 和 HTTP。

1.0 版本推出时，使用了 **WebDAV（Web-based Distributed Authoring and Versionning）**协议和 Exchange 2000 服务器进行同步。这个初始版本主要依赖终端设备「拉取」数据而不是服务器主动「推送」数据。

## WebDAV

WebDAV 是对 HTTP 协议的扩展，使得客户端可以对远程服务器上的文档进行创建、修改或者移动。该协议的详细内容由 [RFC 4918](https://tools.ietf.org/html/rfc4918) 定义。

在 Tim Berners-Lee 的设想中，互联网包含了一个既可以查看，也可以修改的中介，在他最初开发的网页浏览器 WorldWideWeb 里，网页是可以同时被阅读和修改的，但随着因特网规模的的增长，对大部分用户来说，逐渐变成了一个 read-only 的模式，WebDAV 的诞生就是为了打破这种限制。

相比与 GET，POST 等常见的 HTTP 请求方式，WebDAV 进行了一系列扩展，增加了一些新的动作。其中包括了：

- **COPY** -  从一个 URI 复制资源到另外一个
- **LOCK** - 给一个资源加锁，支持共享锁和独有锁
- **MKCOL** - 创建一个文档合集（文件夹）
- **MOVE** - 移动资源
- **PROPFIND** - 获取一个资源的属性，保存为 XML 格式，也可以获取一个文件夹结构这样的信息
- **PROPPATCH** - 在一个原子操作内修改或者删除文档的属性
- **UNLOCK** - 移除锁

对于不同种类的资源，也有相关的协议进行扩展。

例如对于日历，则使用了 CalDAV 协议，可以基于 WebDAV 来获取日历信息。CalDAV 把日历事件抽象成了一种 iCalandar 格式的 HTTP 资源，而这些事件的合集就相当于一个  WebDAV 的文档合集（文件夹）。

## CalDAV - Calendaring Extensions to WebDAV

CalDAV 是一个允许客户端获取和修改远程服务器上的日程信息的标准协议。该协议的详细内容由 [RFC 4791](https://tools.ietf.org/html/rfc4791) 定义。它扩展了 WebDAV 标准并使用 iCalandar 格式的数据。由于多个客户端都可以获取和修改同一部分数据，从而实现方便的协作安排和信息共享。

CalDAV 将各种数据（事件、任务、笔记、忙碌状态等等）放入对应的文件夹内，这些资源和文件夹可以被多个用户访问，使用标准的 HTTP 协议 和 DAV 语义来检测修改冲突和锁定。

## iCalendar
注意不要和苹果的日历应用混淆，iCalendar 的全称是 **Internet Calendaring and Scheduling Core Object Specification**。

iCalendar 是一种基于纯文本的，让用户存储和交换日程信息的媒体格式，例如事件、待办、日程安排、忙碌状态等，这些文件通常以 .ics 或者 .ifb （包含了 availability 信息）为扩展名，文件的具体格式由 [RFC 5545](https://tools.ietf.org/html/rfc5545) 定义。

iCalendar 在设计上是独立于传输协议的，例如你既可以通过一个支持 WebDAV 的服务器共享和修改数据，也可以通过传统的 email 来发送。

iCalendar 的 MIME type 为 *text/calendar*。

iCalendar 实际上大部分基于之前的 vCalendar 格式

一个典型的 iCalendar 格式如下：

```
BEGIN:VCALENDAR
PRODID:-//xyz Corp//NONSGML PDA Calendar Version 1.0//EN
VERSION:2.0
BEGIN:VEVENT
DTSTAMP:19960704T120000Z
UID:uid1@example.com
ORGANIZER:mailto:jsmith@example.com
DTSTART:19960918T143000Z
DTEND:19960920T220000Z
STATUS:CONFIRMED
CATEGORIES:CONFERENCE
SUMMARY:Networld+Interop Conference
DESCRIPTION:Networld+Interop Conference
  and Exhibit\nAtlanta World Congress Center\n
 Atlanta\, Georgia
END:VEVENT
END:VCALENDAR
```

其中第一行必须为 `BEGIN:VCALENDAR`，最后一行为 `END:VCALENDAR`，中间的部分为 `icalbody`。

body 必须包含 `PRODID` 和 `VERSION` 属性，另外必须包含至少一个日历组件。

`VERSION: 1.0` 用来声明数据使用了旧的 `vCalendar` 格式。

有多种不同的日历组件，其中一部分组件可以嵌套其他组件：

- **Events （VEVENT）**
- **To-do (VTODO)**
- **Journal entry (VJOURNAL)**
- **Free/busy time (VFREEBUSY)**
- **availability（VAVAILABILITY）**
- **time zones（VTIMEZONE）**
- **alarms（VALARM）**

iCalendar 和 vCalendar 都支持一些私有的扩展属性，使用 X- 这一前缀开头，其中比较常见的有：

```
X-MICROSOFT-CDO-ALLDAYEVENT - Microsoft Outlook all day event flag
X-MICROSOFT-CDO-BUSYSTATUS - Microsoft Outlook status information
X-MICROSOFT-CDO-INTENDEDSTATUS
```

由于 iCanlendar 的数据格式比较死板，修改并不方便，所以后续又推出了基于 xml 和 json 的实现，即 `xCal` 和 `jCal`。

## jCal - The JSON Format for iCalendar

顾名思义，jCal 是 json 格式的 iCalendar 数据，其具体格式由 [RFC 7265](https://tools.ietf.org/html/rfc7265) 定义。

如一个 iCalendar 格式文件为：

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//Example Client//EN
BEGIN:VTIMEZONE
LAST-MODIFIED:20040110T032845Z
TZID:US/Eastern
BEGIN:DAYLIGHT
DTSTART:20000404T020000
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=4
TZNAME:EDT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
END:DAYLIGHT
BEGIN:STANDARD
DTSTART:20001026T020000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10
TZNAME:EST
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTAMP:20060206T001121Z
DTSTART;TZID=US/Eastern:20060102T120000
DURATION:PT1H
RRULE:FREQ=DAILY;COUNT=5
RDATE;TZID=US/Eastern;VALUE=PERIOD:20060102T150000/PT2H
SUMMARY:Event #2
DESCRIPTION:We are having a meeting all this week at 12 pm fo
r one hour\, with an additional meeting on the first day 2 h
ours long.\nPlease bring your own lunch for the 12 pm meetin
gs.
UID:00959BC664CA650E933C892C@example.com
END:VEVENT
BEGIN:VEVENT
DTSTAMP:20060206T001121Z
DTSTART;TZID=US/Eastern:20060104T140000
DURATION:PT1H
RECURRENCE-ID;TZID=US/Eastern:20060104T120000
SUMMARY:Event #2 bis
UID:00959BC664CA650E933C892C@example.com
END:VEVENT
END:VCALENDAR
```

对应的 jCal 格式为：

```json
["vcalendar",
  [
    ["prodid", {}, "text", "-//Example Corp.//Example Client//EN"],
    ["version", {}, "text", "2.0"]
  ],
  [
    ["vtimezone",
      [
        ["last-modified", {}, "date-time", "2004-01-10T03:28:45Z"],
        ["tzid", {}, "text", "US/Eastern"]
      ],
      [
        ["daylight",
          [
            ["dtstart", {}, "date-time", "2000-04-04T02:00:00"],
            ["rrule",
              {},
              "recur",
              {
                "freq": "YEARLY",
                "byday": "1SU",
                "bymonth": 4
              }
            ],
            ["tzname", {}, "text", "EDT"],
            ["tzoffsetfrom", {}, "utc-offset", "-05:00"],
            ["tzoffsetto", {}, "utc-offset", "-04:00"]
          ],
          []
        ],
        ["standard",
          [
            ["dtstart", {}, "date-time", "2000-10-26T02:00:00"],
            ["rrule",
              {},
              "recur",
              {
                "freq": "YEARLY",
                "byday": "1SU",
                "bymonth": 10
              }
            ],
            ["tzname", {}, "text", "EST"],
            ["tzoffsetfrom", {}, "utc-offset", "-04:00"],
            ["tzoffsetto", {}, "utc-offset", "-05:00"]
          ],
          []
        ]
      ]
    ],
    ["vevent",
      [
        ["dtstamp", {}, "date-time", "2006-02-06T00:11:21Z"],
        ["dtstart",
          { "tzid": "US/Eastern" },
          "date-time",
          "2006-01-02T12:00:00"
        ],
        ["duration", {}, "duration", "PT1H"],
        ["rrule", {}, "recur", { "freq": "DAILY", "count": 5 } ],
        ["rdate",
          { "tzid": "US/Eastern" },
          "period",
          "2006-01-02T15:00:00/PT2H"
        ],
        ["summary", {}, "text", "Event #2"],
        ["description",
          {},
          "text",
          // Note that comments and string concatenation are not
          // allowed per the JSON specification and is used here only
          // to avoid long lines.
          "We are having a meeting all this week at 12 pm for one " +
          "hour, with an additional meeting on the first day 2 " +
          "hours long.\nPlease bring your own lunch for the 12 pm " +
          "meetings."
        ],
        ["uid", {}, "text", "00959BC664CA650E933C892C@example.com"]
      ],
      []
    ],
    ["vevent",
      [
        ["dtstamp", {}, "date-time", "2006-02-06T00:11:21Z"],
        ["dtstart",
          { "tzid": "US/Eastern" },
          "date-time",
          "2006-01-02T14:00:00"
        ],
        ["duration", {}, "duration", "PT1H"],
        ["recurrence-id",
          { "tzid": "US/Eastern" },
          "date-time",
          "2006-01-04T12:00:00"
        ],
        ["summary", {}, "text", "Event #2"],
        ["uid", {}, "text", "00959BC664CA650E933C892C@example.com"]
      ],
      []
    ]
  ]
]
```

## 日历服务

日历实际上是一个容器，容器内部包含了事件、todo和笔记。一个用户可以有多个日历来组织不同类型的事件和todo。

事件是一个你要做的、会持续一段时间的活动，一般具有多个属性，比如名称、位置、开始时间、结束时间等。

Todo与事件不同，拥有两个时间：计划时间和实际时间，而且关注的重点不是时间区间而是某些重要的时间点。

笔记其实不需要时间，但是起到一个组织备忘录的作用，比如会议（属于一个事件）纪要等。

日历服务的核心功能包括：

- 个人日程维护
- 日历共享
- 事件提醒
- 邀请他人加入事件。

在标准日历服务中，所有的数据都是由个人生产的，而数据消费者可能是个人或者团队。如果某个组的成员拥有读写公共日历的权限，那么这些成员同时是数据的生产者和消费者。

企业日历数据主要来自企业的管理信息系统。比如，HR系统的请假管理，可以与企业日历集成，当员工请假时自动更新员工的日历，便于其他人通过日历查看该员工状态。通过集成获取管理信息系统的各项数据，是企业日历的另一个特点。

日历服务 ，本质是通过标准的方法（即前面介绍的相关协议），可以通过多种终端设备的图形界面进行生产数据，也可能是其他分散的服务器节点来生产数据（例如企业内部的信息系统服务），最终交由一个中心化的节点存储数据，并将数据进行集成。

集成的方式可以是数据同步模式，或者是数据共享模式。数据共享模式与数据同步之间的区别是数据共享共享不存储远程服务的数据。

对于数据层的设计参考相关的协议栈。服务端需要提供相应的 HTTP 接口以供客户端或其他服务节点对数据进行增删改查，同时取决于对实时性的要求不同，可能需要考虑使用长链接的能力进行实时推送或者由客户端进行轮询。

标准日历的协议栈中不包括身份验证部分，因此需要开发者自行实现。

## Reference

- [https://en.wikipedia.org/wiki/Exchange_ActiveSync](https://en.wikipedia.org/wiki/Exchange_ActiveSync)
- [https://en.wikipedia.org/wiki/WebDAV](https://en.wikipedia.org/wiki/WebDAV)
- [https://tools.ietf.org/html/rfc4918](https://tools.ietf.org/html/rfc4918)
- [https://en.wikipedia.org/wiki/CalDAV](https://en.wikipedia.org/wiki/CalDAV)
- [https://tools.ietf.org/html/rfc4791](https://tools.ietf.org/html/rfc4791)
- [https://en.wikipedia.org/wiki/ICalendar](https://en.wikipedia.org/wiki/ICalendar)
- [https://tools.ietf.org/html/rfc5545](https://tools.ietf.org/html/rfc5545)
- [https://tools.ietf.org/html/rfc7265](https://tools.ietf.org/html/rfc7265)