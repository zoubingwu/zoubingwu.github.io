---
layout: post
title: "聊聊好的Git work flow"
date: 2017-06-22 20:15:27
tags:
- Git 
description: '大部分人常用的Git命令无外乎git status, git add, git commit, git push等，但培养好的Git的使用习惯和work flow可以在多人协作的过程中获益匪浅。'
---

## Github的初始化

初始创建一个 github 仓库时，github 会给一些命令你去创建 git 本地项目，git init就不用说了，`git remote add origin git@github.com:YongHaoWu/test.git` 你知道这里的 origin 是什么吗？

是的，就仅仅是一个名字，对 `git@github.com:YongHaoWu/test.git` 这个 ssh 地址的命名，你可以把 `origin` 命名为 gakki —— `git remote add gakki git@github.com:YongHaoWu/test.git`, 以后就可以用`git push gakki master`了。

另外，你还可以 add好几个名字，比如：你在 github 跟 coding 同样都有仓库放代码的情况。

`git push -u origin master` , 这里就是把 master （默认 git 分支）推送到 origin， -u也就是`--set-upstream`, 代表的是更新 默认推送的地方，这里就是默认以后`git pull`和`git push`时，都是推送和拉自 origin。