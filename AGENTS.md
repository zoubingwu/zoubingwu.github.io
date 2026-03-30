# Repository Guidelines

## Project Structure & Module Organization
This repository is now an Astro static site. Content lives in `_posts/` with filenames like `YYYY-MM-DD-title.md`. Astro routes are in `src/pages/`, shared UI is in `src/components/`, and the base document wrapper lives in `src/layouts/`. Collection schema and site metadata are defined in `src/content.config.ts` and `src/config/site.ts`.

Static files belong in `public/`, especially `public/assets/` and `public/CNAME`. Sass sources live in `_sass/` and are imported by Astro during build. `dist/` is generated output; do not edit it by hand.

## Build, Test, and Development Commands
Use the repo Node version first: `nvm use`.

`pnpm install` installs dependencies and refreshes `pnpm-lock.yaml`.

`pnpm dev` starts the Astro dev server.

`pnpm check` runs Astro's type and content validation.

`pnpm build` generates the static site into `dist/`.

`pnpm preview` serves the production build locally.

## Coding Style & Naming Conventions
Follow `.editorconfig`: 2-space indentation, LF line endings, UTF-8, trimmed trailing whitespace, and a final newline.

Keep Astro code small and explicit. Prefer straightforward helpers in `src/utils/` over extra abstraction. Use PascalCase for Astro components like `src/components/PostList.astro` and lowercase route/config filenames such as `src/pages/archive.astro`.

## Testing Guidelines
There is no automated test suite yet. Minimum validation for each change:

1. `pnpm check`
2. `pnpm build`
3. `pnpm preview` and spot-check the homepage, archive page, one paginated page, RSS, and any changed post

If you change routing or metadata logic, verify representative URLs under `dist/` such as `/page/2/`, `/archive/`, and one recent post path.

## Commit & Pull Request Guidelines
Recent history favors short imperative subjects like `Add blog post on LSM Trees`, with occasional Conventional Commit prefixes such as `fix(main): ...`. Follow that pattern. Prefer `type(scope): summary` for code changes and clear imperative subjects for content-only updates.

PRs should explain the change, list the commands you ran, and link the relevant issue when there is one. Include screenshots only for layout, template, or CSS changes.
