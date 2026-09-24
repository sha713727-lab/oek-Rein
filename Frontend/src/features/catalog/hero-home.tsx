import {
  brandName,
  heroCtaHref,
  heroCtaLabel,
  heroHeadline,
  heroVideoMobileSrc as defaultHeroVideoMobileSrc,
  heroVideoPosterSrc as defaultHeroVideoPosterSrc,
  heroVideoSrc as defaultHeroVideoSrc,
} from "@/constants/brand";
import type { StorefrontContent } from "@/constants/storefront";
import { HeroTransparentVideo } from "@/features/catalog/hero-transparent-video";
import { RibbonMarquee } from "@/features/catalog/ribbon-marquee";
import { PillCta } from "@/features/motion/pill-cta";

export function HeroHome({ content }: { content: StorefrontContent }) {
  const title = content.heroHeadline || heroHeadline;
  const videoSrc = content.heroVideoSrc || defaultHeroVideoSrc;
  const mobileSrc = content.heroVideoMobileSrc || defaultHeroVideoMobileSrc;
  const posterSrc = content.heroVideoPosterSrc || defaultHeroVideoPosterSrc;
  const usesBundledPoster =
    !posterSrc || posterSrc === defaultHeroVideoPosterSrc;

  return (
    <section className="home-hero" aria-label={title}>
      {/* Preload poster only — `as="video"` is unsupported by browsers. */}
      {usesBundledPoster ? (
        <link rel="preload" as="image" href={posterSrc} type="image/webp" />
      ) : null}
      <div className="home-hero-layout">
        <div className="home-hero-scroll">
          <div className="home-hero-panel">
            <div className="home-hero-entrance" aria-hidden="true">
              <span className="home-hero-decor home-hero-decor--ring" />
              <span className="home-hero-decor home-hero-decor--stroke" />
              <span className="home-hero-accent-dot" />
            </div>

            <h1 className="home-hero-wordmark">
              <span className="home-hero-wordmark-mask">
                <span className="home-hero-wordmark-line">{brandName}</span>
              </span>
            </h1>

            {videoSrc ? (
              <HeroTransparentVideo
                key={videoSrc}
                src={videoSrc}
                mobileSrc={mobileSrc}
                posterSrc={posterSrc}
              />
            ) : null}

            <div className="home-hero-cta-wrap">
              <PillCta href={heroCtaHref} className="home-hero-cta">
                {heroCtaLabel}
              </PillCta>
            </div>
          </div>

          <RibbonMarquee tone="lime" pathId="heroRibbonPath" merged />
        </div>
      </div>
    </section>
  );
}
