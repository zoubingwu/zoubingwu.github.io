import rss from '@astrojs/rss';

import { site } from '../config/site';
import { getPostPath, getSortedPosts } from '../utils/posts';

export async function GET() {
  const posts = await getSortedPosts();

  return rss({
    title: site.name,
    description: site.description,
    site: site.domain,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: getPostPath(post),
    })),
  });
}
