---
layout: post
title: "SQL cheatsheet"
date: 2022-09-17 15:00:33
tags:
- sql
description: "A simple SQL cheat sheet in one page built with Deno."
---

Last couple days I made a simple SQL cheat sheet with [Fresh](https://fresh.deno.dev/docs/introduction) and [Deno Deploy](https://deno.com/deploy). The DX is really impressive. You can [check it out here](https://sql-cheatsheet.deno.dev/). Notice the only javascript code it shipped is 7kb prismjs in total for highlighting SQL code synxtax. This brings a ridiculously fast page load speed.

Combine with Deno Deploy, Fresh provides just-in-time rendering on the edge and it has no build step. Literally one second after the code was pushed to the remote then immediately open browser and refresh, you can see your latest work ready. This DX is insane and really mind blowing for me :D

And thanks to Deno, it also has TypeScript support out of the box and no configuration is necessary. Yes, I'm tired with all those xxx.config.js...

Also, most static content was rendered on server side, no JS is shipped to the client by default, so users don't have to wait for those large js bundle to download and they get only what they need with instant load speed.

For most of the static content websites, Fresh and Deno Deploy definitely is worth looking into.
