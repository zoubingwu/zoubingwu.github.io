/** @jsx jsx */
import { jsx } from "hono/middleware.ts";
import { SiteConfig } from "../lib/config.ts";

export function Footer({ site }: { site: SiteConfig }) {
  return (
    <div class="footer">
      <hr />
      <div class="footer-link">
        <a href="/archive" aria-label="Read more about all archives">
          <i class="fa fa-archive" aria-hidden="true"></i>
        </a>

        {site.author.twitter && (
          <a
            target="_blank"
            href={`https://twitter.com/${site.author.twitter}`}
            aria-label="Read more on twitter"
          >
            <i class="fa fa-twitter" aria-hidden="true"></i>
          </a>
        )}

        {site.author.github && (
          <a
            target="_blank"
            href={`https://github.com/${site.author.github}`}
            aria-label="Read more on github"
          >
            <i class="fa fa-github" aria-hidden="true"></i>
          </a>
        )}

        {site.author.email && (
          <a
            target="_blank"
            href={`mailto:${site.author.email}`}
            aria-label="Email"
          >
            <i class="fa fa-envelope" aria-hidden="true"></i>
          </a>
        )}
      </div>
      ©{site.copyright.year} {site.copyright.name}. All rights reserved.
    </div>
  );
}
