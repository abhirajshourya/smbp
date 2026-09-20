import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Next 16's build-time type-checking can't parse typescript@7's new
    // package layout (it dropped the classic lib/typescript.js Compiler API
    // in favor of the native tsgo binary) and fails with a generic "you're
    // trying to use TypeScript but do not have the required package(s)
    // installed" error. `tsc --noEmit` itself works fine under v7 (see the
    // "typecheck" script/CI step) - just Next's own integration doesn't yet.
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Without an explicit no-cache the browser may serve the worker from
        // its own HTTP cache, which pins users to whatever sw.js they first
        // received — the classic way a service worker becomes unupdatable.
        // Everything the worker caches is versioned, but only if the worker
        // itself can change.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
