import { brandName, heroCtaHref, heroCtaLabel, heroHeadline } from "@/constants/brand";
import type { StorefrontContent } from "@/constants/storefront";
import { HeroTransparentVideo } from "@/features/catalog/hero-transparent-video";
import { RibbonMarquee } from "@/features/catalog/ribbon-marquee";
import { PillCta } from "@/features/motion/pill-cta";
import { resolveHeroVideoSet } from "@/lib/hero-video";

export function HeroHome({ content }: { content: StorefrontContent }) {
  const title = content.heroHeadline || heroHeadline;
  const hero = resolveHeroVideoSet({
    src: content.heroVideoSrc,
    mobileSrc: content.heroVideoMobileSrc,
    posterSrc: content.heroVideoPosterSrc,
  });

  return (
    <section className="home-hero" aria-label={title}>
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

            <HeroTransparentVideo
              key={hero.src}
              src={hero.src}
              mobileSrc={hero.mobileSrc}
              posterSrc={hero.posterSrc}
            />

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
