import Link from "next/link";

import {
  brandName,
  heroCtaHref,
  heroCtaLabel,
  heroHeadline,
  heroVideoSrc as defaultHeroVideoSrc,
} from "@/constants/brand";
import type { StorefrontContent } from "@/constants/storefront";
import { HeroTransparentVideo } from "@/features/catalog/hero-transparent-video";

export function HeroHome({ content }: { content: StorefrontContent }) {
  const title = content.heroHeadline || heroHeadline;
  const videoSrc = content.heroVideoSrc || defaultHeroVideoSrc;

  return (
    <section className="home-hero" aria-label={title}>
      <div className="home-hero-panel">
        <h1 className="home-hero-wordmark">
          <span>{brandName}</span>
        </h1>
        {videoSrc ? <HeroTransparentVideo key={videoSrc} src={videoSrc} /> : null}
        <Link href={heroCtaHref} className="home-hero-cta">
          {heroCtaLabel}
        </Link>
      </div>
    </section>
  );
}
