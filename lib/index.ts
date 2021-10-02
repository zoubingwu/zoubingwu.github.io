import fs from 'fs/promises';
import path from 'path';
import consola from 'consola';
import workerpool from 'workerpool';
import matter from 'gray-matter';
import { pick } from 'lodash';
import dayjs from 'dayjs';
import copy from 'recursive-copy';

import { rm, readFile, getPostUrl } from './utils';
import config from './config';
import { renderArchivePage, renderIndexPage } from './renderer';

const pool = workerpool.pool(path.resolve(process.cwd(), 'lib/worker.js'));

async function readPostList() {
  const files = await fs.readdir('_posts');
  return files
    .filter(file => path.extname(file) === '.md')
    .map(file => path.resolve(process.cwd(), '_posts', file))
    .reverse();
}

async function readPostMetaData(p: string, map: Map<string, PostData>) {
  const data = matter(await readFile(p));
  map.set(p, {
    metadata: pick(data.data, ['title', 'date', 'tags', 'description']),
    content: data.content,
  });
}

export interface PostData {
  metadata: {
    title: string;
    date: Date;
    tags: string[];
    description: string;
  };
  content: string;
}

async function main() {
  consola.info('Clearing output directory...');
  try {
    await rm(config.output);
  } catch {}

  consola.info('Getting post list...');
  const postList = await readPostList();
  const postMap = new Map<string, PostData>();

  consola.info('Getting post metadata...');
  await Promise.all(
    postList.map(postPath => readPostMetaData(postPath, postMap))
  );
  const worker = await pool.proxy();

  consola.info('Processing posts...');
  await Promise.all(
    postList.map(postPath => {
      return worker.transformMarkdownToHtml(postPath, postMap.get(postPath)!);
    })
  );

  consola.info('Processing index page...');
  await renderIndexPage({
    posts: postList
      .map(i => postMap.get(i)!)
      .map(postData => ({
        url: getPostUrl(postData.metadata.date, postData.metadata.title),
        title: postData.metadata.title,
        date: dayjs(postData.metadata.date).format('D MMM YYYY'),
        description: postData.metadata.description,
      })),
  });

  consola.info('Processing archive page...');
  await renderArchivePage({
    posts: postList
      .map(i => postMap.get(i)!)
      .map(postData => ({
        url: getPostUrl(postData.metadata.date, postData.metadata.title),
        title: postData.metadata.title,
        date: dayjs(postData.metadata.date).format('D MMM YYYY'),
      })),
  });

  await pool.terminate();

  consola.info(`Moving assets to ${config.output}/assets...`);
  await copy('./assets', `./${config.output}/assets`);

  consola.success(`Done!`);
}

main();
