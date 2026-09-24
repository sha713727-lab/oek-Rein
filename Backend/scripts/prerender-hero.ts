/**
 * CLI: prerender stacked-alpha hero videos from the white-plate source MP4.
 * Usage: npm run prerender:hero --prefix Backend
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { prerenderHeroVideo } from "../src/server/media/prerender-hero";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const inputPath = path.join(repoRoot, "Frontend", "public", "assets", "videos", "heroVideo.mp4");
const videoDir = path.join(repoRoot, "Frontend", "public", "assets", "videos");
const imageDir = path.join(repoRoot, "Frontend", "public", "assets", "images");

const result = await prerenderHeroVideo({
  inputPath,
  outputDir: videoDir,
  posterDir: imageDir,
  basename: "hero-horse",
  startSec: 3.6,
});

console.log("Hero prerender complete:");
console.log(`  src:       ${result.src}`);
console.log(`  mobileSrc: ${result.mobileSrc}`);
console.log(`  posterSrc: ${result.posterSrc}`);
