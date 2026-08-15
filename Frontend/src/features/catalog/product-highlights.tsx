import Image from "next/image";
import type { ComponentType } from "react";

import { IconDrop, IconFlower, IconGlowFace, IconRabbit } from "@/components/icons/icons";
import {
  PRODUCT_HIGHLIGHTS,
  PRODUCT_HIGHLIGHTS_ALT,
  PRODUCT_HIGHLIGHTS_IMAGE,
  PRODUCT_HIGHLIGHTS_MARK,
  PRODUCT_HIGHLIGHTS_TITLE,
} from "@/constants/site";

type IconProps = { className?: string | undefined };

const HIGHLIGHT_ICONS: Record<(typeof PRODUCT_HIGHLIGHTS)[number]["icon"], ComponentType<IconProps>> = {
  drop: IconDrop,
  rabbit: IconRabbit,
  glow: IconGlowFace,
  flower: IconFlower,
};

function HighlightArrow({ corner }: { corner: (typeof PRODUCT_HIGHLIGHTS)[number]["corner"] }) {
  const paths = {
    tl: "M12 36C38 34 62 24 86 10",
    tr: "M88 36C62 34 38 24 14 10",
    bl: "M12 12C38 14 62 24 86 38",
    br: "M88 12C62 14 38 24 14 38",
  } as const;
  const heads = {
    tl: "M76 6c6 1 10 4 12 8",
    tr: "M24 6c-6 1-10 4-12 8",
    bl: "M76 42c6-1 10-4 12-8",
    br: "M24 42c-6-1-10-4-12-8",
  } as const;

  return (
    <svg className="product-highlights-arrow-svg" viewBox="0 0 100 48" fill="none" aria-hidden="true">
      <path d={paths[corner]} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d={heads[corner]} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
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

export function ProductHighlights() {
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
              <Image
                src={PRODUCT_HIGHLIGHTS_IMAGE}
                alt={PRODUCT_HIGHLIGHTS_ALT}
                width={480}
                height={900}
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
