import workerpool from 'workerpool';
import marked from 'marked';
import * as shiki from 'shiki';
import consola from 'consola';
import dayjs from 'dayjs';

import type { PostData } from '.';
import { renderPostPage } from './renderer';
import { getPostUrl } from './utils';
import config from './config';

marked.setOptions({
  highlight: function (code, lang, callback) {
    Promise.all([
      shiki.getHighlighter({ theme: 'github-light' }),
      shiki.getHighlighter({ theme: 'github-dark' }),
    ]).then(([light, dark]) => {
      try {
        const lightCode = `<div class="shiki-light">${light.codeToHtml(
          code,
          lang
        )}</div>`;
        const darkCode = `<div class="shiki-dark">${dark.codeToHtml(
          code,
          lang
        )}</div>`;

        return callback!(null, lightCode + darkCode);
      } catch (e) {
        consola.error(`Error when parsing code with language ${lang}: `, code);
        return callback!(e);
      }
    });
  },
});

const promisifyMarked = (str: string): Promise<string> =>
  new Promise((resolve, reject) => {
    marked(str, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

async function transformMarkdownToHtml(path: string, post: PostData) {
  consola.info(`Transpiling ${path}`);
  let content: string;
  try {
    content = await promisifyMarked(post.content);
  } catch (e) {
    consola.error(`Error transpiling ${path}`, e);
    return;
  }
  const postUrl = getPostUrl(post.metadata.date, post.metadata.title);
  const dir = `${config.output}${postUrl}`;
  const output = `${dir}/index.html`;

  consola.info(`Generating ${output}`);
  await renderPostPage({
    title: post.metadata.title,
    tags: post.metadata.tags,
    date: dayjs(post.metadata.date).format('D MMM YYYY'),
    content,
    description: post.metadata.description,
    url: postUrl,
    publishTime: post.metadata.date.toISOString(),
    site: config,
    output,
  });
}

workerpool.worker({
  transformMarkdownToHtml,
});
