import type { ComponentType } from "react";

import { IconDrop, IconFlower, IconGlowFace, IconRabbit } from "@/components/icons/icons";
import {
  PRODUCT_HIGHLIGHTS,
  PRODUCT_HIGHLIGHTS_ALT,
  PRODUCT_HIGHLIGHTS_IMAGE,
  PRODUCT_HIGHLIGHTS_MARK,
  PRODUCT_HIGHLIGHTS_TITLE,
} from "@/constants/site";
import { CmsImage } from "@/features/media/cms-image";

type IconProps = { className?: string | undefined };

const HIGHLIGHT_ICONS: Record<(typeof PRODUCT_HIGHLIGHTS)[number]["icon"], ComponentType<IconProps>> = {
  drop: IconDrop,
  rabbit: IconRabbit,
  glow: IconGlowFace,
  flower: IconFlower,
};

function HighlightArrow({ corner }: { corner: (typeof PRODUCT_HIGHLIGHTS)[number]["corner"] }) {
  const shafts = {
    tl: "M10 12c28 6 56 18 92 36",
    tr: "M110 12C82 18 54 30 18 48",
    bl: "M10 44c28-6 56-18 92-36",
    br: "M110 44C82 38 54 26 18 8",
  } as const;
  const heads = {
    tl: "M84 28c8 8 14 16 18 20M80 50c10 0 18-1 22-2",
    tr: "M36 28c-8 8-14 16-18 20M40 50c-10 0-18-1-22-2",
    bl: "M84 28c8-8 14-16 18-20M80 6c10 0 18 1 22 2",
    br: "M36 28c-8-8-14-16-18-20M40 6c-10 0-18 1-22 2",
  } as const;

  return (
    <svg className="product-highlights-arrow-svg" viewBox="0 0 120 56" fill="none" aria-hidden="true">
      <path d={shafts[corner]} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d={heads[corner]} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HighlightBotanical({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 260 200" fill="none" aria-hidden="true">
      <path
        d="M28 168c32-64 82-96 138-54 24 18 42 12 64-16"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path d="M78 118c20-34 52-42 84-10" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
    </svg>
  );
}

export function ProductHighlights({ image }: { image: string }) {
  return (
    <section className="product-highlights" aria-labelledby="product-highlights-title">
      <HighlightBotanical className="product-highlights-vine" />
      <div className="product-highlights-inner">
        <h2 id="product-highlights-title" className="product-highlights-title">
          {PRODUCT_HIGHLIGHTS_TITLE}{" "}
          <span className="product-highlights-title-mark">
            {PRODUCT_HIGHLIGHTS_MARK}
            <svg className="product-highlights-title-oval" viewBox="0 0 220 78" fill="none" aria-hidden="true">
              <path
                d="M14 42C28 10 188 6 206 38c-12 28-168 34-192 4Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h2>
        <div className="product-highlights-board">
          <div className="product-highlights-stage">
            <span className="product-highlights-glow" aria-hidden="true" />
            <div className="product-highlights-product">
              <CmsImage
                src={image || PRODUCT_HIGHLIGHTS_IMAGE}
                alt={PRODUCT_HIGHLIGHTS_ALT}
                width={304}
                height={637}
                sizes="(max-width: 480px) 7rem, (max-width: 899px) 8.25rem, 18rem"
                className="product-highlights-cutout"
              />
            </div>
          </div>
          {PRODUCT_HIGHLIGHTS.map((item) => {
            const Icon = HIGHLIGHT_ICONS[item.icon];
            return (
              <article key={item.id} className={`product-highlights-card product-highlights-card--${item.corner}`}>
                <span className="product-highlights-icon">
                  <Icon />
                </span>
                <h3 className="product-highlights-name">{item.title}</h3>
                <p className="product-highlights-copy">{item.description}</p>
                <span className="product-highlights-arrow">
                  <HighlightArrow corner={item.corner} />
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
