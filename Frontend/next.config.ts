import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const directoryName = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: directoryName,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  experimental: {
    // Storefront publish can include a hero video (~25MB) plus several images.
    // Proxy/middleware default is 10MB; server actions need headroom for the multipart form.
    serverActions: {
      bodySizeLimit: "80mb",
    },
    proxyClientMaxBodySize: "80mb",
  },
};

export default nextConfig;
