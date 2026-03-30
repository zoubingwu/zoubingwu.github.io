# Repository Guidelines

## Project Structure & Module Organization
`lib/` holds the Node/TypeScript static site generator: `index.ts` coordinates the build, `worker.ts` renders Markdown posts, and `renderer.ts` writes EJS pages. Content lives in `_posts/` with filenames like `YYYY-MM-DD-title.md`. Page templates are in `_pages/`, shared layout partials are in `_layouts/`, and Sass sources live in `_sass/`.

Static files belong in `assets/`, with compiled CSS written to `assets/css/main.css`. `deno/` plus `main.tsx` contains a separate Deno/Hono rendering path used for local experimentation. `dist/` is generated output; do not edit it by hand.

## Build, Test, and Development Commands
Use the repo Node version first: `nvm use`.

`npm run build` builds the site into `dist/` using `tsx lib/index.ts`.

`npm run build:css` compiles `_sass/main.scss` into `assets/css/main.css`.

`npm run fmt` formats `lib/*.ts` with Prettier.

`npm run serve` serves `dist/` locally after a build.

`deno task start` runs the Deno/Hono variant from `main.tsx`.

## Coding Style & Naming Conventions
Follow `.editorconfig`: 2-space indentation, LF line endings, UTF-8, trimmed trailing whitespace, and a final newline. Prettier is configured for single quotes and no parens around single-argument arrow functions.

Keep generator code small and explicit. Prefer straightforward functions over extra abstraction. Use lowercase filenames in `lib/` (`lib/renderer.ts`) and PascalCase component filenames in `deno/` (`deno/PostPage.tsx`).

## Testing Guidelines
There is no automated test suite yet. Minimum validation for each change:

1. `npm run build`
2. `npm run build:css` if Sass changed
3. `npm run serve` and spot-check the homepage, archive page, and any changed post or template

If you modify `main.tsx` or files in `deno/`, also run `deno task start`.

## Commit & Pull Request Guidelines
Recent history favors short imperative subjects like `Add blog post on LSM Trees`, with occasional Conventional Commit prefixes such as `fix(main): ...`. Follow that pattern. Prefer `type(scope): summary` for code changes and clear imperative subjects for content-only updates.

PRs should explain the change, list the commands you ran, and link the relevant issue when there is one. Include screenshots only for layout, template, or CSS changes.
