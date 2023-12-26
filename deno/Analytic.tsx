/** @jsx jsx */
import { jsx } from "hono/middleware.ts";

export function Analytic() {
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "76b8468271b24f3180af2110f74841c3"}'
    />
  );
}
