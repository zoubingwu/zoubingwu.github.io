import fs from 'fs/promises';
import mkdirp from 'mkdirp';
import { minify } from 'html-minifier-terser';
import rimraf from 'rimraf';
import dayjs from 'dayjs';

export function ensureDirExists(dir: string) {
  try {
    mkdirp.sync(dir);
  } catch {}
}

export function minifyHtml(html: string) {
  return minify(html, {
    removeAttributeQuotes: true,
    removeComments: true,
    collapseWhitespace: true,
  });
}

export const rm = (dest: string) =>
  new Promise((resolve, reject) => {
    rimraf(dest, err => (err ? reject(err) : resolve(null)));
  });

export async function readFile(p: string) {
  return await fs.readFile(p, 'utf-8');
}

export async function getFileCreatedTime(p: string) {
  const { birthtime } = await fs.stat(p)
  return birthtime
}

export function getPostUrl(date: Date, title: string) {
  return `/${dayjs(date).format('YYYY-MM-DD')}/${title
    .toLowerCase()
    .split(' ')
    .join('-')}`;
}
