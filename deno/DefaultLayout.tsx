/** @jsx jsx */
import { jsx } from "hono/middleware.ts";
import { ReactNode } from "react";
import { Head } from "./Head.tsx";
import { Footer } from "./Footer.tsx";
import { config, SeoConfig } from "../lib/config.ts";

export function DefaultLayout({
  children,
  seo,
}: {
  children: ReactNode;
  seo: SeoConfig;
}) {
  return (
    <html lang="en">
      <Head site={config} seo={seo} />
      <body>
        <main class="content-container">
          {children}
          <Footer site={config} />
        </main>
      </body>
    </html>
  );
}
