# My blog based on jekyll

## Content

Check [https://shadeofgod.github.io/](https://shadeofgod.github.io/) for details.

JavaScript模板引擎的实现原理 | 14 AUG 2017
漫谈从文本到数据结构 | 06 AUG 2017
JSON解析器的简单实现 | 31 JUL 2017
编写shell脚本的一些简单概念 | 27 JUL 2017
移动端click事件的延迟处理 | 23 JUL 2017
详解正则表达式中的capture group | 16 JUL 2017
使用chrome开发者工具调试iOS webview | 08 JUL 2017
聊聊好的Git work flow | 28 JUN 2017
Vue源码学习-番外篇-proxy实现数据监听 | 22 JUN 2017
利用通用链接从web端引流到iOS app | 15 JUN 2017
Vue源码学习-监听数组的变化 | 10 JUN 2017
Vue源码学习-监听对象的变化 | 02 JUN 2017
debounce and throttle | 23 MAY 2017
设计模式实践之发布-订阅模式 | 14 MAY 2017
设计模式实践之单例模式 | 11 MAY 2017
从promise说说异步编程 | 29 APR 2017
input标签上传文件的重置问题 | 21 APR 2017
关于最近的一点想法和领悟 | 20 APR 2017
javascript简单实现跨浏览器复制粘贴 | 31 MAR 2017
工作一周小结 | 11 MAR 2017
浏览器端css和js的性能优化 | 04 MAR 2017
css3打造流光色彩特效 | 27 FEB 2017
关于复杂度大O标记的简介 | 14 FEB 2017
Event order | 05 FEB 2017
使用css打造自定义firefox界面 | 09 JAN 2017
创建对象的几种模式（二） | 04 JAN 2017
创建对象的几种模式（一） | 03 JAN 2017
javascript中的类型判断 | 29 DEC 2016
关于Javascript中的this | 09 DEC 2016
闭包运用的一个典型例子 | 05 DEC 2016
about DOM extension | 20 NOV 2016
css3 flexbox | 13 NOV 2016
优秀和糟糕前端工程师的区别 | 11 NOV 2016
对HTML5中section标签的一点理解 | 31 OCT 2016
Airbnb js代码规范（译） | 28 OCT 2016
通过javascript修改css样式的常用方式 | 26 OCT 2016
Javascript中操作数组的一些常用方法总结 | 18 OCT 2016
Closure for dummies(translated) | 15 OCT 2016

## Features

- Markdown
- Gitment comment system
- Google analytics
- Pagination support
- Custom tag
- SEO support

## Installtion

1. First fork or clone the repo.
2. Change your forked repository name to **USERNAME.github.io** where **USERNAME** is your github username.
3. Access your new blog via [https://username.github.io](https://username.github.io/).

## Configuration

Go inside folder and run `jekyll serve` or `rake preview`. This will build a website which you can access [https://localhost:4000](https://localhost:4000/). You need to have [Jekyll](https://jekyllrb.com/docs/installation/) installed to do this.

### basic

- Config your blog name.

```yaml
name: <blog-name>
```

- These configuration in `author:` is for links to icons in footer. If you want to add more link icons, modify `_includes/footer.html` file.

```yaml
author:
  facebook:         your-id
  twitter:          your-id
  github:           your-id
  linkedin:         your-id
  medium:           your-id
  tumblr:           your-id
  email:            your-id@your-email.com
```

- Change copyright year and name in footer.

```yaml
copyright:
  year:             2017
  name:             Kiko
```

### Google analytics

- Change this to your Google Analytic ID.

```yaml
google-analytics:
  id:               "your-id"
```

### ~~Disqus~~ Gitment

- ~~Change this to your Disqus short name.~~
- see [Gitment documentation](https://github.com/imsun/gitment)

### URL

- Config your domain.

```yaml
url: "https://<your-name>.github.io"
```

- **NOTE** When if running locally, change url to

```yaml
url: "https://localhost:4000"
```

- Change this to your branch name where *gh-pages* resides.
- **NOTE** apply only if you used **Method 2** for installation.

```yaml
baseurl: "/<branch-name>"
```

## Rakefile Usage

```bash
# Create new post
$ rake post title="A Title" [date="2015-08-16"] [tags="[tag1, tag2]"] 

# Create new draft post
$ rake draft title="A Title" [date="2015-08-16"] [tags="[tag1, tag2]"]

# Install Jekyll Plugins. Do before running in local.
$ rake geminstall

# Run in Local
$ rake preview
```

## License

This theme is released under MIT License.

### 