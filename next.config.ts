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
};

export default nextConfig;
