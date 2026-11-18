import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // The dev-only Next.js button sits bottom right, clear of the auth pages' © line and the learner menu.
  devIndicators: { position: 'bottom-right' },

  // Local development: the API only allows the live site's origin (CORS), so with API_PROXY_TARGET
  // set the browser calls /backend/... on this server, which forwards it to the API.
  async rewrites() {
    const target = process.env.API_PROXY_TARGET?.replace(/\/$/, '');
    return target ? [{ source: '/backend/:path*', destination: `${target}/:path*` }] : [];
  },
};

export default nextConfig;
