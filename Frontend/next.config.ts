import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const directoryName = path.dirname(fileURLToPath(import.meta.url));

/** Locale-aware rewrites onto canonical /collections/* product routes (2A). */
const collectionRewrites = [
  { source: "/:locale/saddles", destination: "/:locale/collections/saddles" },
  { source: "/:locale/tack/bridles", destination: "/:locale/collections/bridles" },
  { source: "/:locale/tack/reins", destination: "/:locale/collections/reins" },
  { source: "/:locale/tack/matching-sets", destination: "/:locale/collections/complete-sets" },
  { source: "/:locale/custom/colors", destination: "/:locale/collections/custom-colors" },
  { source: "/:locale/custom/personalization", destination: "/:locale/collections/personalized" },
  { source: "/:locale/saddles/western", destination: "/:locale/collections/western-saddles" },
  { source: "/:locale/saddles/handcrafted-leather", destination: "/:locale/collections/engraved-saddles" },
  { source: "/:locale/saddles/crystal-rhinestone", destination: "/:locale/collections/crystal-rhinestone" },
  { source: "/:locale/saddles/studded", destination: "/:locale/collections/studded-leather" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: directoryName,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // CMS uploads keep unique filenames, so optimized variants can cache hard.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "oakrein.com" },
      { protocol: "https", hostname: "www.oakrein.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async redirects() {
    return [
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/:locale/about", destination: "/:locale/about-us", permanent: true },
    ];
  },
  async rewrites() {
    return collectionRewrites;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "80mb",
    },
    proxyClientMaxBodySize: "80mb",
  },
};

export default nextConfig;
