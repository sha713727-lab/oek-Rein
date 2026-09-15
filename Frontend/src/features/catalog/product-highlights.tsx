import type { ComponentType } from "react";

import { IconBalance, IconHorse, IconLeather, IconStitch } from "@/components/icons/icons";
import { brandName } from "@/constants/brand";
import { PRODUCT_HIGHLIGHTS, PRODUCT_HIGHLIGHTS_ALT } from "@/constants/site";
import {
  PRODUCT_HIGHLIGHTS_FLOAT_SLOTS,
  type ProductHighlightsFloatId,
} from "@/constants/storefront";
import { HighlightCurves } from "@/features/catalog/highlight-curves";
import { HighlightRibbons } from "@/features/catalog/highlight-ribbons";
import { CmsImage } from "@/features/media/cms-image";

type IconProps = { className?: string | undefined };

const HIGHLIGHT_ICONS: Record<string, ComponentType<IconProps>> = {
  leather: IconLeather,
  stitch: IconStitch,
  balance: IconBalance,
  horse: IconHorse,
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

/** Hand-drawn flourish that sits under the section heading. */
function HighlightSquiggle() {
  return (
    <svg className="product-highlights-squiggle" viewBox="0 0 148 34" fill="none" aria-hidden="true">
      <path
        d="M7 21c13-13 32-16 42-7 8 7-1 15-9 11-8-4 3-15 19-15 15 0 23 8 32 12 6 3 13 3 19-3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M28 27c12-6 27-8 40-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
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

export function ProductHighlights({
  image,
  floats,
}: {
  image: string;
  floats: Record<ProductHighlightsFloatId, string>;
}) {
  return (
    <section className="product-highlights" aria-labelledby="product-highlights-title">
      <HighlightCurves />
      <HighlightBotanical className="product-highlights-vine" />
      <div className="product-highlights-inner">
        <h2 id="product-highlights-title" className="product-highlights-title">
          Why {brandName}? <span className="section-mark">Because the craftsmanship speaks for itself!</span>
        </h2>
        <HighlightSquiggle />
        <p className="product-highlights-lead">
          Premium handcrafted Pakistani leather tack for North American riders — comfort from the first cinch to the last
          cool-down, with quality you can feel in the arena and on the trail.
        </p>
        <div className="product-highlights-board">
          <HighlightRibbons />
          {PRODUCT_HIGHLIGHTS_FLOAT_SLOTS.map((slot) => {
            const src = floats[slot.id]?.trim();
            if (!src) {
              return null;
            }
            return (
              <span key={slot.id} className={`product-highlights-float product-highlights-float--${slot.id}`}>
                <CmsImage src={src} alt="" width={slot.size} height={slot.size} />
              </span>
            );
          })}
          <div className="product-highlights-stage">
            <span className="product-highlights-glow" aria-hidden="true" />
            <div className="product-highlights-product">
              {image ? (
                <CmsImage
                  src={image}
                  alt={PRODUCT_HIGHLIGHTS_ALT}
                  width={420}
                  height={880}
                  sizes="(max-width: 480px) 48vw, (max-width: 899px) 42vw, 34rem"
                  className="product-highlights-cutout"
                />
              ) : null}
            </div>
          </div>
          {PRODUCT_HIGHLIGHTS.map((item) => {
            const Icon = HIGHLIGHT_ICONS[item.icon] ?? IconHorse;
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
