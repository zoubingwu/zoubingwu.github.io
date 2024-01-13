/** @jsx jsx */
/** @jsxFrag Fragment */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as process from "node:process";
import { chunk, pick } from "lodash-es";
import matter from "matter";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { getHighlighter } from "shikiji";
import { Hono } from "hono/mod.ts";
import { jsx, logger, serveStatic } from "hono/middleware.ts";
import { ListPage } from "./deno/ListPage.tsx";
import { PostPage } from "./deno/PostPage.tsx";
import { DefaultLayout } from "./deno/DefaultLayout.tsx";
import { ArchivePage } from "./deno/ArchivePage.tsx";
import { config } from "./lib/config.ts";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC");

const highlighter = await getHighlighter({
  themes: [config.shikiTheme],
  langs: ["javascript"],
});

const marked = new Marked(
  markedHighlight({
    async: true,
    async highlight(code, lang, info) {
      await highlighter.loadLanguage(lang as "js");
      return highlighter.codeToHtml(code, {
        lang,
        theme: config.shikiTheme,
      });
    },
  }),
);

async function readPostList() {
  const files = await fs.readdir("_posts");
  return files
    .filter((file) => path.extname(file) === ".md")
    .map((file) => path.resolve(process.cwd(), "_posts", file))
    .sort()
    .reverse();
}

async function readPostData(p: string): Promise<PostData> {
  const data = matter(await fs.readFile(p));
  return {
    metadata: pick(data.data, ["title", "date", "tags", "description"]),
    content: data.content,
  };
}

interface PostData {
  metadata: {
    title: string;
    date: Date;
    tags: string[];
    description: string;
  };
  content: string;
}

function getPostUrl(date: Date, title: string) {
  return `/${dayjs(date).utc().format("YYYY-MM-DD")}/${
    title
      .toLowerCase()
      .split(" ")
      .join("-")
  }`;
}

function getPageUrl(page: number) {
  return `${config.domain}/page/${page}`;
}

const app = new Hono();
const postList = await readPostList();

const map = new Map<string, PostData>();
await Promise.all(
  postList.map((postPath) =>
    readPostData(postPath).then((data) => {
      map.set(postPath, {
        metadata: data.metadata,
        content: "",
      });
    })
  ),
);

const posts = postList
  .map((i) => map.get(i)!)
  .map((postData) => ({
    url: getPostUrl(postData.metadata.date, postData.metadata.title),
    title: postData.metadata.title,
    date: dayjs(postData.metadata.date).format("D MMM YYYY"),
    description: postData.metadata.description,
  }));
const pages = chunk(posts, config.paginate);

app.use("*", logger());
app.use("/assets/*", serveStatic({ root: "./" }));

app.get("/robots.txt", (c) => c.text("User-agent: *\nAllow: /"));

app.get("/", (c) => {
  const nextPagePath = getPageUrl(2);
  const paginator = {
    posts: pages.at(0),
    nextPagePath,
  };

  return c.html(
    <DefaultLayout
      seo={{
        isArticle: false,
        title: config.name,
        description: config.name,
        url: config.domain,
        next: nextPagePath,
      }}
    >
      <ListPage paginator={paginator} />
    </DefaultLayout>,
  );
});

app.get("/page/:page{\\d+}", (c) => {
  const { page } = c.req.param();
  console.log("page: ", page);

  const pageNumber = Number(page);
  if (typeof pageNumber !== "number") {
    return c.redirect("/");
  }

  const nextPagePath = pageNumber === pages.length - 1
    ? undefined
    : getPageUrl(pageNumber + 1);
  const previousPagePath = pageNumber === 1 ? '/' : getPageUrl(pageNumber - 1);
  const paginator = {
    posts: pages.at(pageNumber),
    nextPagePath,
    previousPagePath,
  };

  return c.html(
    <DefaultLayout
      seo={{
        isArticle: false,
        title: config.name,
        description: config.name,
        url: config.domain,
        next: paginator.nextPagePath,
      }}
    >
      <ListPage paginator={paginator} />
    </DefaultLayout>,
  );
});

app.get("/:date{\\d{4}-\\d{2}-\\d{2}}/:title", async (c) => {
  const { date } = c.req.param();
  console.log("date: ", date);

  const postPath = postList.find((i) => i.split("/").pop()?.startsWith(date));
  console.log("postPath: ", postPath);

  if (!postPath) {
    return c.redirect("/");
  }
  const post = map.get(postPath);

  if (!post) {
    return c.redirect("/");
  }

  if (!post.content) {
    const data = await readPostData(postPath);
    post.content = await marked.parse(data.content, { async: true });
  }

  const metadata = post.metadata;
  const content = post.content;
  const postUrl = getPostUrl(metadata.date, metadata.title);

  return c.html(
    <DefaultLayout
      seo={{
        title: `${metadata.title} | ${config.domain}`,
        description: metadata.description,
        url: `${config.domain}${postUrl}`,
        isArticle: true,
        publishTime: metadata.date.toISOString(),
      }}
    >
      <PostPage
        title={metadata.title}
        date={dayjs(metadata.date).format("D MMM YYYY")}
        content={content}
      />
    </DefaultLayout>,
  );
});

app.get("/archive", (c) => {
  return c.html(
    <DefaultLayout
      seo={{
        isArticle: false,
        title: config.name,
        description: config.name,
        url: `${config.domain}/archive`,
      }}
    >
      <ArchivePage title="Archive" posts={posts} />
    </DefaultLayout>,
  );
});

Deno.serve(app.fetch);
