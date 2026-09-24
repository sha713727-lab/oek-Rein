import { randomBytes } from "node:crypto";
import { access } from "node:fs/promises";
import path from "node:path";

import { logger } from "@/lib/logger";
import { uploadDirectory } from "@/server/http/serve-upload";
import { prerenderHeroVideo } from "@/server/media/prerender-hero";
import { storefrontService } from "@/server/services/storefront/storefront.service";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function uploadsBasename(src: string): string | null {
  if (!src.startsWith("/uploads/")) {
    return null;
  }
  const name = path.basename(src);
  if (!name || name.includes("..")) {
    return null;
  }
  return name;
}

/**
 * When PRERENDER_HERO_ON_START=1: if the published hero is a raw /uploads video
 * without mobile + poster siblings, queue a stacked-alpha prerender and persist URLs.
 * Default off — avoids slow container boots.
 */
export async function prerenderHeroOnStartIfNeeded(): Promise<void> {
  if (process.env.PRERENDER_HERO_ON_START !== "1") {
    return;
  }

  const storefront = await storefrontService.getFull();
  const content = storefront.content as typeof storefront.content & {
    heroVideoMobileSrc?: string;
    heroVideoPosterSrc?: string;
  };
  const heroSrc = String(content.heroVideoSrc ?? "").trim();
  const basename = uploadsBasename(heroSrc);
  if (!basename) {
    logger.info({ heroSrc }, "PRERENDER_HERO_ON_START: hero is not a raw /uploads video; skip");
    return;
  }

  const directory = uploadDirectory();
  const inputPath = path.join(directory, basename);
  if (!(await fileExists(inputPath))) {
    logger.warn({ inputPath }, "PRERENDER_HERO_ON_START: hero upload file missing; skip");
    return;
  }

  const mobileSrc = String(content.heroVideoMobileSrc ?? "").trim();
  const posterSrc = String(content.heroVideoPosterSrc ?? "").trim();
  const mobileName = uploadsBasename(mobileSrc);
  const posterName = uploadsBasename(posterSrc);
  const hasMobile =
    Boolean(mobileName) && (await fileExists(path.join(directory, mobileName as string)));
  const hasPoster =
    Boolean(posterName) && (await fileExists(path.join(directory, posterName as string)));

  // Already prerendered assets referenced in CMS.
  if (hasMobile && hasPoster) {
    logger.info("PRERENDER_HERO_ON_START: mobile + poster siblings present; skip");
    return;
  }

  // Sibling files next to a -720.mp4 desktop cut (CLI / prior prerender naming).
  if (basename.endsWith("-720.mp4")) {
    const stem = basename.slice(0, -"-720.mp4".length);
    const siblingMobile = path.join(directory, `${stem}-480.mp4`);
    const siblingPoster = path.join(directory, `${stem}-poster.webp`);
    if ((await fileExists(siblingMobile)) && (await fileExists(siblingPoster))) {
      logger.info("PRERENDER_HERO_ON_START: on-disk -480/-poster siblings found; skip");
      return;
    }
  }

  const outBase = `hero-${Date.now()}-${randomBytes(4).toString("hex")}`;
  logger.info({ inputPath, outBase }, "PRERENDER_HERO_ON_START: queueing hero prerender");
  const result = await prerenderHeroVideo({
    inputPath,
    outputDir: directory,
    basename: outBase,
    startSec: 3.6,
  });

  await storefrontService.updatePublished(storefront.commerce, storefront.theme, {
    ...content,
    heroVideoSrc: result.src,
    heroVideoMobileSrc: result.mobileSrc,
    heroVideoPosterSrc: result.posterSrc,
  } as typeof storefront.content);

  logger.info(
    { src: result.src, mobileSrc: result.mobileSrc, posterSrc: result.posterSrc },
    "PRERENDER_HERO_ON_START: storefront hero updated",
  );
}
