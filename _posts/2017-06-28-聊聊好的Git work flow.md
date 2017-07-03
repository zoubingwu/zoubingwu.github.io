---
layout: post
title: "聊聊好的Git work flow"
date: 2017-06-22 20:15:27
tags:
- Git 
description: '大部分人常用的Git命令无外乎git status, git add, git commit, git push等，但培养好的Git的使用习惯和work flow可以在多人协作的过程中获益匪浅。'
---

## Github的初始化

初始创建一个 github 仓库时，github 会给一些命令你去创建 git 本地项目，git init就不用说了。

`git remote add origin git@github.com:xxxxx/test.git` 这里的 origin 就是一个名字，对该 ssh 地址的命名，你可以把 `origin` 命名为 gakki —— `git remote add gakki git@github.com:xxxxx/test.git`, 以后就可以用`git push gakki master`了。

另外，你还可以 add好几个名字，比如：你在 github 跟 coding 同样都有仓库放代码的情况。

`git push -u origin master` , 这里就是把 master （默认 git 分支）推送到 origin， -u也就是`--set-upstream`, 代表的是更新 默认推送的地方，这里就是默认以后`git pull`和`git push`时，都是推送和拉自 origin。

## 写好commit message

都知道，代码是编写一次，修改很多次，然后阅读更多次，代码可读性的重要程度不言而喻，但是在项目演进过程中有个很重要的记录也是会读很多次的，那就是 Git 的提交日志。

打开项目，执行 `git log`，信息量过少甚至是误导的 commit message 非常常见，比如：

```shell
fix     => 这到底是 fix 什么？为什么 fix？怎么 fix 的？
update  => 更新了什么？是为了解决什么问题？
test    => 这个最让人崩溃，难道是为了测试？至于为了测试而去提交一次代码么？
```

惭愧的说，我自己平时也会犯懒随便写一点东西省事儿。

写出好的 `commit message` 需要对每次提交的改动做认真深入的思考，认真回答上面提到的几个问题：

What: 简短的描述这次的改动
Why：为什么修改？就是要说明这次改动的必要性，可以是需求来源，任务卡的链接，或者其他相关的资料；
How: 做了什么修改？需要说明的是使用了什么方法（比如数据结构、算法）来解决了哪个问题；
此外，还有个非常重要的点就是本次修改的副作用可能有什么，因为工程就是不断在做权衡，本次修改为以后留下了什么坑？还需要什么工作？都可以记录在 `commit message` 中。

从本质上来说，上面只是你思考问题的框架和记录内容的形式，真正重要的是你要仔细思考的那几个问题，因为一定程度上，`commit message` 就是文档，活的文档，记录了仓库的所有变迁。

## Always use rebase

```shell
git rebase

Reapply commits from one branch on top of another branch.
Commonly used to "move" an entire branch to another base, creating copies of the commits in the new location.
```

相信你可以理解以上的英文：把 A 分支 rebase 到 B 分支，也就是把 A 的 commit 与 B 的合并，并且保留 B 独特的 commit。

因为在分支的 `pull` 和 `merge` 的时候， 当出现冲突而你解决掉后，会有多余的 merge 信息（ commit message ），所以推荐在自己的分支开发时，永远使用 fetch，rebase （不会出现多余信息，处理冲突更加自由）。

## git stash 暂存更改

时刻要注意，当前修改没有 `commit` 的时候，不能 `checkout` 切换分支。

此时不想 commit，便需要 `git stash` 暂存更改；顾名思义，stash 使用 stack （栈）实现，所以可以 `git stash` 存多次，然后切换分支后， `git stash pop` 撤出来。

## 不用担心的回退

回退大家应该都知道git reset --hard commitID, 把整个 git 回退到这个 commitID 里；

其实除了--hard, 还有 soft。

hard是把改动全部都丢弃，而soft则柔软一些，仅仅是把所做的 commit 丢掉，而改动都保留在本地——通常用来修改，再重新 commit 一遍。

做了胡乱的更改，导致 `git log` 都不正常，找不回那个 commit 了怎么办？

不用担心， 还有 `git reflog — Reference logs`, or "reflogs", record when the tips of branches and other references were updated in the local repository.

用它可以看到你对当前项目所做过的所有 git 操作，所有 git 操作的 id 号——意味着你可以回退到任意的时刻。

所以，只要你没有把改动没有做 commit 就丢失，又或者用git push -f把 github 仓库覆盖了，你就可以恢复任意时刻的东西。

## Gitflow 工作流程

不同的公司可能对于流程的管理也有区别，这里我们只说说比较典型的做法。

### 历史分支

相对使用仅有的一个master分支，Gitflow工作流使用2个分支来记录项目的历史。master分支存储了正式发布的历史，而develop分支作为功能的集成分支。这样也方便master分支上的所有提交分配一个版本号。

### 功能分支

每个新功能位于一个自己的分支，这样可以push到中央仓库以备份和协作。但功能分支不是从master分支上拉出新分支，而是使用develop分支作为父分支。当新功能完成时，合并回develop分支。新功能提交应该从不直接与master分支交互。

### 发布分支

一旦develop分支上有了做一次发布（或者说快到了既定的发布日）的足够功能，就从develop分支上fork一个发布分支。新建的分支用于开始发布循环，所以从这个时间点开始之后新的功能不能再加到这个分支上 —— 这个分支只应该做Bug修复、文档生成和其它面向发布任务。一旦对外发布的工作都完成了，发布分支合并到master分支并分配一个版本号打好Tag。另外，这些从新建发布分支以来的做的修改要合并回develop分支。

使用一个用于发布准备的专门分支，使得一个团队可以在完善当前的发布版本的同时，另一个团队可以继续开发下个版本的功能。
这也打造定义良好的开发阶段（比如，可以很轻松地说，『这周我们要做准备发布版本4.0』，并且在仓库的目录结构中可以实际看到）。

### 维护分支

维护分支或说是热修复（hotfix）分支用于生成快速给产品发布版本（production releases）打补丁，这是唯一可以直接从master分支fork出来的分支。修复完成，修改应该马上合并回master分支和develop分支（当前的发布分支），master分支应该用新的版本号打好Tag。

为Bug修复使用专门分支，让团队可以处理掉问题而不用打断其它工作或是等待下一个发布循环。你可以把维护分支想成是一个直接在master分支上处理的临时发布。

## 总结

记住，这里演示的工作流只是可能用法的例子，而不是在实际工作中使用Git不可违逆的条例。所以不要畏惧按自己需要对工作流的用法做取舍。不变的目标就是让Git为你所用。

#### ref

[你们仍未掌握那天所学的 git 知识](https://www.v2ex.com/t/368083)

[使用 "5W1H" 写出高可读的 Git Commit Message](https://zhuanlan.zhihu.com/p/26791124)

[Git工作流指南：Gitflow工作流](https://www.atlassian.com/git/tutorials/comparing-workflows)

