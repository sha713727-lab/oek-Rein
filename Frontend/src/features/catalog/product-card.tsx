"use client";

import Image from "next/image";
import Link from "next/link";

import { IconHeart, IconPlus } from "@/components/icons/icons";
import { Logo } from "@/components/ui/logo";
import { addToCartAction } from "@/features/cart/actions";
import { toggleWishlistAction } from "@/features/wishlist/actions";
import { cn } from "@/lib/cn";

export type CatalogProduct = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number | null | undefined;
  images: string[];
};

export function ProductCard({ product, wished }: { product: CatalogProduct; wished: boolean }) {
  const primary = product.images[0];
  const hasSale = Boolean(product.originalPrice && product.originalPrice > product.price);

  return (
    <article className="product-card group flex flex-col bg-brand-white">
      <div className="product-card-visual">
        <div className="product-card-frame">
          <Link href={`/product/${product.id}`} className="block h-full w-full">
            <div className="product-card-media">
              {primary ? (
                <Image src={primary} alt={product.title} fill sizes="(min-width:1024px) 25vw, 50vw" className="product-card-image is-active object-cover object-top" />
              ) : (
                <div className="flex h-full items-center justify-center text-text-muted">No image</div>
              )}
            </div>
          </Link>
          <div className="product-card-topbar">
            <span className="product-card-brand">
              <Logo theme="light" size="watermark" linked={false} />
            </span>
            <form action={toggleWishlistAction}>
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
          <form action={addToCartAction} className="product-quick-add">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="quantity" value="1" />
            <button type="submit" className="product-quick-add-btn" aria-label={`Add ${product.title} to bag`}>
              <IconPlus />
            </button>
          </form>
        </div>
      </div>
      <Link href={`/product/${product.id}`} className="product-card-details">
        <h3 className="product-card-name">{product.title}</h3>
        <div className="product-card-pricing">
          {hasSale && product.originalPrice ? (
            <span className="product-card-price-original">PKR {product.originalPrice.toLocaleString()}</span>
          ) : null}
          <span className={`product-card-price${hasSale ? " product-card-price--sale" : ""}`}>
            PKR {product.price.toLocaleString()}
          </span>
        </div>
      </Link>
    </article>
  );
}
