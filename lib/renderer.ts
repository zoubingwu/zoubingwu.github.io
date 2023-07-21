import path from 'node:path';
import fs from 'node:fs/promises';
import ejs, { Data } from 'ejs';
import consola from 'consola';
import { chunk } from 'lodash';

import { ensureDirExists, minifyHtml } from './utils';
import config, { SiteConfig } from './config';

type LayoutData = Data;

export function renderDefaultLayout(str: string, layoutData: LayoutData) {
  return ejs.renderFile(`_layouts/default.html`, {
    ...layoutData,
    content: str,
  });
}

interface RenderPageOption {
  template: string;
  pageData: Data;
  layoutData: Data;
  output: string;
  minify?: boolean;
}

export function renderPage({
  template,
  pageData,
  layoutData,
  output,
  minify = true,
}: RenderPageOption) {
  const dir = path.dirname(output);

  ensureDirExists(dir);

  return ejs
    .renderFile(template, pageData)
    .then(str => renderDefaultLayout(str, layoutData))
    .then(minify ? minifyHtml : a => a)
    .then(str => fs.writeFile(output, str));
}

interface RenderPostData {
  title: string;
  tags: string[];
  date: string;
  content: string;
  site: SiteConfig;
  description: string;
  url: string;
  publishTime: string;
  output: string;
}

export async function renderPostPage(post: RenderPostData) {
  return renderPage({
    template: `_pages/post.html`,
    pageData: {
      page: {
        title: post.title,
        tags: post.tags,
        date: post.date,
      },
      content: post.content,
    },
    layoutData: {
      site: config,
      seo: {
        title: `${post.title} | ${config.domain}`,
        description: post.description,
        url: `${config.domain}${post.url}`,
        isArticle: true,
        publishTime: post.publishTime,
      },
    },
    output: post.output,
  });
}

interface RenderArchiveData {
  posts: Array<{
    url: string;
    title: string;
    date: string;
  }>;
}

export function renderArchivePage(data: RenderArchiveData) {
  const output = `${config.output}/archive/index.html`;
  consola.info(`Generating ${output}`);
  return renderPage({
    template: `_pages/archive.html`,
    pageData: {
      site: config,
      posts: data.posts,
      page: {
        title: 'Archive',
      },
    },
    layoutData: {
      site: config,
      seo: {
        isArticle: false,
        title: config.name,
        description: config.name,
        url: `${config.domain}/archive`,
      },
    },
    output,
  });
}

interface RenderIndexData {
  posts: Array<{
    url: string;
    title: string;
    date: string;
    description: string;
  }>;
}

export async function renderIndexPage(data: RenderIndexData) {
  const { posts } = data;
  const pages = chunk(posts, config.paginate);

  await Promise.all([
    pages.map((page, i) => {
      const previousPagePath =
        i === 1 ? '/' : i > 1 ? `${config.domain}/page${i}` : '';
      const nextPagePath =
        i < pages.length ? `${config.domain}/page${i + 2}` : '';

      const paginator = {
        posts: page.map(post => ({
          url: post.url,
          date: post.date,
          title: post.title,
          description: post.description,
        })),
        previousPagePath,
        nextPagePath,
      };

      const output =
        i === 0
          ? `${config.output}/index.html`
          : `${config.output}/page${i + 1}/index.html`;

      consola.info(`Generating ${output}...`);

      return renderPage({
        template: `_pages/index.html`,
        output,
        pageData: { site: config, paginator },
        layoutData: {
          site: config,
          seo: {
            isArticle: false,
            title: config.name,
            description: config.name,
            url: config.domain,
            next: nextPagePath,
          },
        },
      });
    }),
  ]);
}
