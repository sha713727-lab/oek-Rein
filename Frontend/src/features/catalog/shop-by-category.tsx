import Link from "next/link";
import type { ComponentType } from "react";

import {
  IconArrowRight,
  IconDrop,
  IconDropper,
  IconFlask,
  IconFlower,
  IconHeartLeaf,
  IconLeafMark,
  IconRabbit,
  IconSparkle,
} from "@/components/icons/icons";
import {
  SHOP_RANGE_SIGNATURE,
  SHOP_RANGE_SUPPORT,
  SHOP_RANGE_TRUST,
} from "@/constants/site";
import { type StorefrontShopCategory, tileStyle } from "@/constants/storefront";
import { CmsImage } from "@/features/media/cms-image";

type IconProps = { className?: string | undefined };

const CARD_ICONS: Record<string, ComponentType<IconProps>> = {
  flower: IconFlower,
  drop: IconDrop,
  dropper: IconDropper,
  leaf: IconLeafMark,
  sparkle: IconSparkle,
};

const TRUST_ICONS: Record<(typeof SHOP_RANGE_TRUST)[number]["icon"], ComponentType<IconProps>> = {
  leaf: IconLeafMark,
  rabbit: IconRabbit,
  flask: IconFlask,
  heart: IconHeartLeaf,
};

function RangeBotanical({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 180 120" fill="none" aria-hidden="true">
      <path
        d="M12 96c28-48 62-62 98-28 18 16 34 12 52-16"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path d="M58 70c14-22 36-26 56-8" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
    </svg>
  );
}

export function ShopByCategory({ categories }: { categories: StorefrontShopCategory[] }) {
  if (categories.length === 0) {
    return null;
  }
  return (
    <section className="shop-range" aria-labelledby="shop-range-title">
      <div className="shop-range-blob shop-range-blob--mint" aria-hidden="true" />
      <div className="shop-range-blob shop-range-blob--blush" aria-hidden="true" />
      <RangeBotanical className="shop-range-vine shop-range-vine--tl" />
      <RangeBotanical className="shop-range-vine shop-range-vine--br" />
      <div className="shop-range-inner">
        <header className="shop-range-header">
          <p className="shop-range-eyebrow">
            <span className="shop-range-eyebrow-line" />
            <span className="shop-range-eyebrow-copy">
              Explore <IconSparkle className="shop-range-eyebrow-mark" /> our range
            </span>
            <span className="shop-range-eyebrow-line" />
          </p>
          <h2 id="shop-range-title" className="shop-range-title">
            Shop by Category
          </h2>
          <p className="shop-range-support">{SHOP_RANGE_SUPPORT}</p>
        </header>
        <div className="shop-range-track">
          {categories.map((category) => {
            const CardIcon = CARD_ICONS[category.icon] ?? IconSparkle;
            return (
              <article key={category.id} className="shop-range-card" style={tileStyle(category.color)}>
                <span className="shop-range-card-icon">
                  <CardIcon />
                </span>
                <div className="shop-range-card-visual">
                  <span className="shop-range-card-orb" aria-hidden="true" />
                  <RangeBotanical className="shop-range-card-vine" />
                  <div className="shop-range-card-product">
                    {category.image ? (
                      <CmsImage
                        src={category.image}
                        alt={category.alt || category.title}
                        fill
                        sizes="(min-width: 1200px) 16vw, 240px"
                        className="shop-range-card-image"
                      />
                    ) : null}
                  </div>
                </div>
                <div className="shop-range-card-copy">
                  <h3 className="shop-range-card-title">{category.title}</h3>
                  <span className="shop-range-card-rule" aria-hidden="true" />
                  <p className="shop-range-card-desc">{category.description}</p>
                  <Link href={category.href} className="shop-range-card-cta">
                    Explore
                    <IconArrowRight className="shop-range-card-cta-arrow" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <ul className="shop-range-trust">
          {SHOP_RANGE_TRUST.map((item) => {
            const TrustIcon = TRUST_ICONS[item.icon];
            return (
              <li key={item.id} className="shop-range-trust-item">
                <span className="shop-range-trust-icon">
                  <TrustIcon />
                </span>
                <span className="shop-range-trust-copy">
                  <span className="shop-range-trust-title">{item.title}</span>
                  <span className="shop-range-trust-detail">{item.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="shop-range-signature">
          <IconSparkle className="shop-range-signature-mark" />
          {SHOP_RANGE_SIGNATURE}
        </p>
      </div>
    </section>
  );
}
