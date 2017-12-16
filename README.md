# My blog based on jekyll

## Content

Check [https://shadeofgod.github.io/archive/](https://shadeofgod.github.io/archive/) for details.

## Features

- Markdown
- Gitalk comment system
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

### ~~Disqus~~ ~~Gitment~~ Gitalk

- ~~Change this to your Disqus short name.~~
- ~~see [Gitment documentation](https://github.com/imsun/gitment)~~
- see [Gitalk documentation](https://github.com/gitalk/gitalk)

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
