/** @jsx jsx */
import { jsx } from "hono/middleware.ts";
import { Post } from "../lib/config.ts";

interface ArchivePageProps {
  title: string;
  posts: Post[];
}

export function ArchivePage({ title, posts }: ArchivePageProps) {
  return (
    <div class="page">
      <div class="page-title">{title}</div>
      <div class="archive">
        <div class="archive-list">
          {posts.length === 0 && <h2>No post found</h2>}

          {posts.map((p) => (
            <div class="archive-list-post" key={p.title}>
              <a href={p.url}>
                <span class="archive-list-post-title">{p.title}</span>
                <span class="archive-list-post-date">
                  <time>| {p.date}</time>
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
