---
layout: post
title: "curl usage"
date: 2018-03-07 12:33:21
tags:
- command line tools
- linux
description: "Brief summary about the usage of curl."
---

## Introduction
curl is a tool to transfer data from or to a server, using one of the supported protocols (DICT, FILE, FTP, FTPS, GOPHER, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, POP3, POP3S, RTMP, RTSP, SCP, SFTP, SMB, SMBS, SMTP, SMTPS, TELNET and TFTP). 

The command is designed to work without user interaction.

curl offers a busload of useful tricks like proxy support, user authentication, FTP upload, HTTP post, SSL connections, cookies,  file  transfer  resume, Metalink, and more. As you will see below, the number of features will make your head spin!


This is a simple summary about the usage of curl, for more details, just `man curl` in your terminal.

## get raw content

```sh
curl www.sina.com

curl https://api.github.com/search/repositories?q=react
```

use `-o` option to write to file instead of stdout.

```sh
curl -o <filename> www.sina.com
```

## follow redirect

use `-L` option to follow the redirect.

```sh
curl -L www.sina.com

# will go to www.sina.com.cn 
```

## show response header

use `-i` option to show the response header with response.
use `-I` option to only display the response header.

```sh
curl -i www.sina.com
```

## verbose

use `-v` option to make the operation more talkative.

```sh
curl -v www.sina.com
```

use `--trace <filename>` or `--trace-ascii <filename>` to write a debug trace to file.

```sh
curl --trace log.txt www.sina.com
curl --trace-ascii log.txt www.sina.com
```

## send form data

simply add in the url for get method.

```sh
curl example.com/form.cgi?data=xxx
```

use `-X` option to specify request command.
use `--data` option for post method.

```sh
curl -X POST --data "data=xxx" example.com/form.cgi
```

use `--form` option to specify httmp multipart data.

assuming the form was like below: 

```html
<form method="POST" enctype='multipart/form-data' action="upload.cgi">
　　<input type=file name=upload>
　　<input type=submit name=press value="OK">
</form>
```

```sh
curl --form upload=@localfilename --form press=OK [URL]
```

## referer

```sh
curl --referer http://www.referer.com http://www.destination.com
```

## user agent

```sh
curl --user-agent "[User Agent]" [URL]
```

## cookie

use `-b` or `--cookie` option to read cookies from file or string.

```sh
curl --cookie "name=xxx" www.example.com
```

use `-c` option to write cookies to file after operation.

```sh
$ curl -c cookies http://example.com
$ curl -b cookies http://example.com
```

## add header

```sh
curl --header "Content-Type:application/json" http://example.com
```

## authentication

```sh
curl --user name:password example.com
```
