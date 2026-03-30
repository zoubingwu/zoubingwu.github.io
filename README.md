# zoubingwu's blog

![status](https://github.com/zoubingwu/zoubingwu.github.io/actions/workflows/deploy.yml/badge.svg)

Astro-powered static blog for [zoubingwu.com](https://zoubingwu.com/).

## Development

```bash
nvm use
pnpm install
pnpm dev
```

## Build

```bash
pnpm check
pnpm build
pnpm preview
```

## Structure

- Posts live in `_posts/`
- Routes, layouts, and components live in `src/`
- Static assets live in `public/assets/`
- Sass source lives in `_sass/`
