import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getCollection, type CollectionEntry } from 'astro:content';

import { site } from '../config/site';

dayjs.extend(utc);

export type PostEntry = CollectionEntry<'posts'>;

export interface PostListItem {
  url: string;
  title: string;
  date: string;
  description: string;
}

export interface ArchiveListItem {
  url: string;
  title: string;
  date: string;
}

export async function getSortedPosts() {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.id.localeCompare(a.id));
}

export function getPostDate(post: PostEntry) {
  return dayjs.utc(post.data.date).format('YYYY-MM-DD');
}

export function getPostTitleSlug(post: PostEntry) {
  return post.data.title.toLowerCase().split(' ').join('-');
}

export function getPostPath(post: PostEntry) {
  return `/${getPostDate(post)}/${getPostTitleSlug(post)}`;
}

export function formatPostDate(date: Date) {
  return dayjs.utc(date).format('D MMM YYYY');
}

export function getPaginatedPath(page: number) {
  return page <= 1 ? '/' : `/page/${page}`;
}

export function getAbsoluteUrl(path: string) {
  return new URL(path, site.domain).toString();
}

export function toPostListItem(post: PostEntry): PostListItem {
  return {
    url: getPostPath(post),
    title: post.data.title,
    date: formatPostDate(post.data.date),
    description: post.data.description,
  };
}

export function toArchiveListItem(post: PostEntry): ArchiveListItem {
  return {
    url: getPostPath(post),
    title: post.data.title,
    date: formatPostDate(post.data.date),
  };
}

export function getPaginatedPosts(posts: PostEntry[], page: number) {
  const start = (page - 1) * site.paginate;
  return posts.slice(start, start + site.paginate);
}
