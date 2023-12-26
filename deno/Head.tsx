/** @jsx jsx */
/** @jsxFrag Fragment */
import { Fragment, jsx } from "hono/middleware.ts";
import { SeoConfig, SiteConfig } from "../lib/config.ts";
import { Analytic } from "./Analytic.tsx";

export interface HeadProps {
  seo: SeoConfig;
  site: SiteConfig;
}

export function Head({ seo, site }: HeadProps) {
  return (
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="keywords"
        content="blog,html,css,javascript,react,vue,nodejs"
      />
      <meta name="description" content="zoubingwu 个人博客, zoubingwu's blog" />
      <link
        href="/assets/images/favicon.ico"
        rel="bookmark"
        type="image/x-icon"
      />
      <link href="/assets/images/favicon.ico" rel="icon" type="image/x-icon" />
      <link
        href="/assets/images/favicon.ico"
        rel="shortcut icon"
        type="image/x-icon"
      />
      <link rel="stylesheet" href="/assets/css/main.css" type="text/css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300&display=swap"
        rel="stylesheet"
      />
      <link
        rel="alternate"
        type="application/rss+xml"
        title="RSS Feed for <%- site.name %>"
        href="/feed.xml"
      />
      <title>{seo.title}</title>
      <meta property="og:title" content={seo.title} />
      <meta property="og:locale" content="en_US" />
      <meta name="description" content={seo.description} />
      <meta property="og:description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content={site.name} />
      {seo.next && <link prefetch rel="next" href={seo.next} />}

      {seo.isArticle && (
        <>
          <meta property="og:type" content="article" />
          <meta property="article:published_time" content={seo.publishTime} />
        </>
      )}
      <meta name="twitter:card" content="summary" />
      <meta property="twitter:title" content={seo.title} />

      <Analytic />
    </head>
  );
}
