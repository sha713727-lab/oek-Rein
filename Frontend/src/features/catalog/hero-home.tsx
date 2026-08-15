import Image from "next/image";
import Link from "next/link";

import { IconSketchArrow, IconSparkle, IconStarBurst } from "@/components/icons/icons";
import {
  heroCtaHref,
  heroCtaLabel,
  heroExploreLabel,
  heroHeadline,
  heroProductAlt,
  heroProductSrc,
  heroProofLabel,
  heroProofValue,
  heroSupport,
} from "@/constants/brand";
import { HeroWaveMarquee } from "@/features/catalog/hero-wave-marquee";

const PROOF_FACES = [
  { src: "/assets/images/women.jpg", alt: "Reviewed by a Zermae customer" },
  { src: "/assets/images/women.png", alt: "Loved by a Zermae customer" },
  { src: "/assets/images/newArrival.jpg", alt: "Chosen by a Zermae customer" },
] as const;

const EXPLORE_COPY = Array.from({ length: 3 }, () => `${heroExploreLabel.toUpperCase()} •`).join(" ");

function HeroBotanical() {
  return (
    <svg className="home-hero-botanical" viewBox="0 0 320 160" fill="none" aria-hidden="true">
      <path
        d="M18 118c28-62 72-78 112-46 22 18 38 14 58-12 24-32 62-42 96-18"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M92 86c18-28 46-34 70-12"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M168 62c12-22 32-28 54-16"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeroFlowerMark() {
  return (
    <svg className="home-hero-flower" viewBox="0 0 220 220" fill="none" aria-hidden="true">
      <path
        d="M110 28c18 28 18 52 0 80-18-28-18-52 0-80Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M110 28c-18 28-18 52 0 80 18-28 18-52 0-80Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M182 110c-28 18-52 18-80 0 28-18 52-18 80 0Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M182 110c-28-18-52-18-80 0 28 18 52 18 80 0Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <circle cx="110" cy="110" r="9" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function HeroHome() {
  return (
    <section className="home-hero" aria-label={heroHeadline}>
      <div className="home-hero-blob" aria-hidden="true" />
      <HeroFlowerMark />
      <div className="home-hero-shell">
        <div className="home-hero-copy">
          <IconSparkle className="home-hero-sparkle" />
          <h1 className="home-hero-title">
            <span>Beauty</span>
            <span>Crafted</span>
            <span>With Purity</span>
          </h1>
          <p className="home-hero-support">{heroSupport}</p>
          <Link href={heroCtaHref} className="home-hero-cta">
            {heroCtaLabel}
          </Link>
        </div>
        <div className="home-hero-stage">
          <div className="home-hero-arch" aria-hidden="true" />
          <HeroBotanical />
          <div className="home-hero-product">
            <Image
              src={heroProductSrc}
              alt={heroProductAlt}
              width={304}
              height={637}
              priority
              sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 70vw"
              className="home-hero-product-image"
            />
            <IconSparkle className="home-hero-product-sparkle" />
          </div>
        </div>
        <div className="home-hero-proof">
          <div className="home-hero-proof-cluster">
            <div className="home-hero-faces">
              {PROOF_FACES.map((face) => (
                <span key={face.src} className="home-hero-face">
                  <Image src={face.src} alt={face.alt} fill sizes="40px" className="home-hero-face-image" />
                </span>
              ))}
              <IconSketchArrow className="home-hero-proof-arrow" />
            </div>
            <p className="home-hero-proof-stat">
              <span className="home-hero-proof-value">{heroProofValue}</span>
              <span className="home-hero-proof-label">{heroProofLabel}</span>
            </p>
          </div>
          <Link href={heroCtaHref} className="home-hero-badge" aria-label={heroExploreLabel}>
            <span className="home-hero-badge-ring">
              <svg viewBox="0 0 200 200" aria-hidden="true">
                <defs>
                  <path id="homeHeroExplorePath" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
                </defs>
                <text className="home-hero-badge-type">
                  <textPath href="#homeHeroExplorePath">{EXPLORE_COPY}</textPath>
                </text>
              </svg>
            </span>
            <IconStarBurst className="home-hero-badge-star" />
          </Link>
        </div>
      </div>
      <HeroWaveMarquee />
    </section>
  );
}
