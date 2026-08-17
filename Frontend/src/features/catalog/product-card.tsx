"use client";

import Link from "next/link";

import { IconHeart, IconPlus } from "@/components/icons/icons";
import { formatMoney, tileStyle } from "@/constants/storefront";
import { AddToBagForm } from "@/features/cart/add-to-bag-form";
import { CmsImage } from "@/features/media/cms-image";
import { toggleWishlistAction } from "@/features/wishlist/actions";
import { cn } from "@/lib/cn";

export type ProductCardTone = "blush" | "mint" | "lavender";

const TONE_COLORS: Record<ProductCardTone, string> = {
  blush: "#f0c5bf",
  mint: "#d5e4cf",
  lavender: "#efe4ee",
};

export type CatalogProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number | null | undefined;
  images: string[];
  tileColor?: string | null;
};

export function ProductCard({
  product,
  wished,
  tone = "blush",
  color,
  currency = "PKR",
}: {
  product: CatalogProduct;
  wished: boolean;
  tone?: ProductCardTone;
  color?: string;
  currency?: string;
}) {
  const primary = product.images[0];
  const hasSale = Boolean(product.originalPrice && product.originalPrice > product.price);

  return (
    <article className="product-card" style={tileStyle(color || TONE_COLORS[tone])}>
      <div className="product-card-media-wrap">
        <div className="product-card-media-clip">
          <Link href={`/product/${product.id}`} className="product-card-media-link" aria-label={product.title}>
            <span className="product-card-orb" aria-hidden="true" />
            {primary ? (
              <CmsImage
                src={primary}
                alt={product.title}
                fill
                sizes="(min-width: 1024px) 28vw, 90vw"
                className="product-card-still"
              />
            ) : (
              <span className="product-card-empty">No image</span>
            )}
          </Link>
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
        <AddToBagForm productId={product.id} className="product-quick-add">
          <button type="submit" className="product-quick-add-btn" aria-label={`Add ${product.title} to bag`}>
            <IconPlus />
          </button>
        </AddToBagForm>
      </div>
      <Link href={`/product/${product.id}`} className="product-card-copy">
        <h3 className="product-card-name">{product.title}</h3>
        {product.description ? <p className="product-card-desc">{product.description}</p> : null}
        <p className="product-card-price-row">
          {hasSale && product.originalPrice ? (
            <span className="product-card-price-original">{formatMoney(product.originalPrice, currency)}</span>
          ) : null}
          <span className={`product-card-price${hasSale ? " product-card-price--sale" : ""}`}>
            {formatMoney(product.price, currency)}
          </span>
        </p>
      </Link>
    </article>
  );
}
