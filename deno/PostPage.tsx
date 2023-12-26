/** @jsx jsx */
import { jsx } from "hono/middleware.ts";

interface PostPageProps {
  title: string;
  date: string;
  tags?: string[];
  content: string;
}
export function PostPage({ title, date, tags, content }: PostPageProps) {
  return (
    <div class="post">
      <div class="post-title">{title}</div>
      <span class="post-date">
        <time>{date}</time>
      </span>
      <div class="post-tag">
        <ul>
          {tags?.map((i) => (
            <li key={i}>
              <a>
                <span>
                  <i class="fa fa-paperclip" aria-hidden="true"></i>
                  {i}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </div>
  );
}
