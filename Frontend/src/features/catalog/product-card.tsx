"use client";

import Link from "next/link";

import { IconHeart } from "@/components/icons/icons";
import { formatMoney } from "@/constants/storefront";
import { CmsImage } from "@/features/media/cms-image";
import { PillCta } from "@/features/motion/pill-cta";
import { toggleWishlistAction } from "@/features/wishlist/actions";
import { cn } from "@/lib/cn";

export type ProductCardTone = "blush" | "mint" | "lavender";

export type CatalogProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number | null | undefined;
  images: string[];
  tileColor?: string | null;
};

/** VOLDOG soft-gray product card — same language as category cards. */
export function ProductCard({
  product,
  wished,
  currency = "USD",
  ctaLabel = "Shop",
}: {
  product: CatalogProduct;
  wished: boolean;
  tone?: ProductCardTone;
  color?: string;
  currency?: string;
  ctaLabel?: string;
}) {
  const primary = product.images[0];
  const href = `/product/${product.id}`;
  const hasSale = Boolean(product.originalPrice && product.originalPrice > product.price);

  return (
    <article className="product-card">
      <Link href={href} className="product-card-hit" aria-label={product.title} />
      <div className="product-card-media" aria-hidden={primary ? true : undefined}>
        <span className="product-card-glow" aria-hidden="true" />
        <div className="product-card-product">
          {primary ? (
            <CmsImage
              src={primary}
              alt=""
              fill
              sizes="(min-width: 1024px) 28vw, (min-width: 768px) 40vw, 45vw"
              className="product-card-still"
            />
          ) : (
            <span className="product-card-empty">No image</span>
          )}
        </div>
        <form action={toggleWishlistAction} className="product-card-heart-form">
          <input type="hidden" name="productId" value={product.id} />
          <button
            type="submit"
            className={cn("product-card-wishlist", wished && "is-active")}
            aria-label={wished ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
            aria-pressed={wished}
          >
            <IconHeart />
          </button>
        </form>
      </div>
      <div className="product-card-copy">
        <h3 className="product-card-name">{product.title}</h3>
        <p className="product-card-price-row">
          {hasSale && product.originalPrice ? (
            <span className="product-card-price-original">{formatMoney(product.originalPrice, currency)}</span>
          ) : null}
          <span className={`product-card-price${hasSale ? " product-card-price--sale" : ""}`}>
            {formatMoney(product.price, currency)}
          </span>
        </p>
        {product.description ? (
          <p className="product-card-desc">
            {product.description.length > 90 ? `${product.description.slice(0, 87).trimEnd()}…` : product.description}
          </p>
        ) : null}
      </div>
      <PillCta href={href} className="product-card-cta">
        {ctaLabel}
      </PillCta>
    </article>
  );
}
