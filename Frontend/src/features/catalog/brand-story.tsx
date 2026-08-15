import Image from "next/image";

import { IconFlower, IconLeafMark } from "@/components/icons/icons";
import {
  brandMark,
  brandStoryEnd,
  brandStoryLead,
  brandStoryMid,
  brandStoryPortraitAlt,
  brandStoryPortraitSrc,
  brandStoryPrimaryAlt,
  brandStoryPrimarySrc,
  brandStorySecondaryAlt,
  brandStorySecondarySrc,
} from "@/constants/brand";

function StoryBotanical({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 280 220" fill="none" aria-hidden="true">
      <path
        d="M24 188c36-72 88-108 148-64 28 22 48 16 72-18"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path d="M86 132c22-38 58-48 92-12" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
      <path d="M48 96c18-42 52-58 86-22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function LeafCluster({ className }: { className: string }) {
  return (
    <span className={className} aria-hidden="true">
      <IconLeafMark />
      <IconLeafMark />
      <IconLeafMark />
    </span>
  );
}

export function BrandStory() {
  return (
    <section className="brand-story" aria-labelledby="brand-story-title">
      <StoryBotanical className="brand-story-vine brand-story-vine--tl" />
      <StoryBotanical className="brand-story-vine brand-story-vine--br" />
      <div className="brand-story-shell">
        <figure className="brand-story-still">
          <span className="brand-story-still-orb" aria-hidden="true" />
          <span className="brand-story-still-product brand-story-still-product--rear">
            <Image src={brandStorySecondarySrc} alt="" fill sizes="180px" className="brand-story-cutout" />
          </span>
          <span className="brand-story-still-product brand-story-still-product--front">
            <Image src={brandStoryPrimarySrc} alt={brandStoryPrimaryAlt} fill sizes="200px" className="brand-story-cutout" />
          </span>
        </figure>
        <div className="brand-story-copy">
          <h2 id="brand-story-title" className="sr-only">
            Our story
          </h2>
          <p className="brand-story-text">
            <span className="brand-story-name">{brandMark}</span>
            <span className="brand-story-inline">
              <span className="brand-story-inline-still">
                <Image src={brandStoryPrimarySrc} alt={brandStoryPrimaryAlt} fill sizes="88px" className="brand-story-cutout" />
              </span>
              <span className="brand-story-inline-still brand-story-inline-still--mint">
                <Image src={brandStorySecondarySrc} alt={brandStorySecondaryAlt} fill sizes="88px" className="brand-story-cutout" />
              </span>
            </span>
            {brandStoryLead}{" "}
            <LeafCluster className="brand-story-leaves" /> {brandStoryMid}{" "}
            <IconFlower className="brand-story-bloom" /> {brandStoryEnd}
          </p>
        </div>
        <figure className="brand-story-photo">
          <span className="brand-story-photo-clip">
            <Image
              src={brandStoryPortraitSrc}
              alt={brandStoryPortraitAlt}
              fill
              sizes="(min-width: 1024px) 16vw, 40vw"
              className="brand-story-photo-image"
            />
          </span>
          <IconFlower className="brand-story-photo-bloom" />
        </figure>
      </div>
    </section>
  );
}
