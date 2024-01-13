/** @jsx jsx */
import { jsx } from "hono/middleware.ts";
import { Post } from "../lib/config.ts";

export interface ListPageProps {
  paginator: {
    posts: Post[];
    nextPagePath?: string;
    previousPagePath?: string;
  };
}

export function ListPage({ paginator }: ListPageProps) {
  return (
    <div class="list">
      {paginator.posts.length === 0 && <h2>No post found</h2>}

      {paginator.posts.map((post) => (
        <div class="list-post">
          <a href={post.url}>
            <div class="list-post-date">
              <time>{post.date}</time>
            </div>
            <div class="list-post-title">{post.title}</div>
            {post.description && (
              <div class="list-post-desc">{post.description}</div>
            )}
          </a>
        </div>
      ))}

      <div class="list-pagination">
        <span class="list-pagination-previous">
          {paginator.previousPagePath && (
            <a href={paginator.previousPagePath} class="previous">
              <i class="fa fa-angle-left" aria-hidden="true"></i> previous
            </a>
          )}
        </span>

        <span class="list-pagination-next">
          {paginator.nextPagePath && (
            <a href={paginator.nextPagePath} class="next">
              next <i class="fa fa-angle-right" aria-hidden="true"></i>
            </a>
          )}
        </span>
      </div>
    </div>
  );
}
