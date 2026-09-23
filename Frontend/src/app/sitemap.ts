import type { MetadataRoute } from "next";

const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

const paths = [
  "/",
  "/best-sellers",
  "/collections/all",
  "/collections/new",
  "/collections/saddles",
  "/collections/bridles",
  "/collections/halters",
  "/collections/care",
  "/about-us",
  "/contact",
  "/privacy",
  "/terms",
  "/shipping",
  "/returns",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${appUrl}${path}`,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
