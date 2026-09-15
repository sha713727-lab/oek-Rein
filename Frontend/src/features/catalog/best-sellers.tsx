"use client";

import Link from "next/link";

import { IconHeart, IconPlus, IconStarBurst } from "@/components/icons/icons";
import { BEST_SELLERS_CTA, BEST_SELLERS_CTA_HREF, BEST_SELLERS_VIEW } from "@/constants/site";
import { formatMoney, tileStyle } from "@/constants/storefront";
import { AddToBagForm } from "@/features/cart/add-to-bag-form";
import { CatalogEmptyState } from "@/features/catalog/catalog-empty-state";
import type { ResolvedBestSeller } from "@/features/catalog/resolve-best-sellers";
import { CmsImage } from "@/features/media/cms-image";
import { toggleWishlistAction } from "@/features/wishlist/actions";
import { cn } from "@/lib/cn";

const VIEW_COPY = Array.from({ length: 3 }, () => `${BEST_SELLERS_VIEW.toUpperCase()} •`).join(" ");

export function BestSellers({ items, currency = "PKR" }: { items: ResolvedBestSeller[]; currency?: string }) {
  const empty = items.length === 0;
  return (
    <section className="best-sellers" aria-labelledby="best-sellers-title">
      <div className="best-sellers-wash" aria-hidden="true" />
      <div className="best-sellers-blob best-sellers-blob--mint" aria-hidden="true" />
      <div className="best-sellers-inner">
        <header className="best-sellers-header">
          <h2 id="best-sellers-title" className="best-sellers-title">
            <span className="section-mark">Rider favorites</span> for every ride!
          </h2>
          <p className="best-sellers-support">
            Discover the tack our community reaches for again and again — ready for the barn and the arena.
          </p>
        </header>
        {empty ? (
          <CatalogEmptyState
            eyebrow="Bestsellers"
            title="No products yet"
            copy="Bestsellers will appear here once products are published. Explore new arrivals while we finish curating this selection."
            primaryHref="/collections/all"
            primaryLabel="Shop All"
            secondaryHref="/collections/new"
            secondaryLabel="New Arrivals"
          />
        ) : (
          <>
            <div className="best-sellers-grid">
              {items.map((item) => (
                <article key={item.key} className="best-sellers-card" style={tileStyle(item.color)}>
                  <div className="best-sellers-media">
                    <div className="best-sellers-media-clip">
                      <Link href={item.href} className="best-sellers-media-link" aria-label={item.title}>
                        <span className="best-sellers-orb" aria-hidden="true" />
                        <CmsImage
                          src={item.image}
                          alt={item.alt}
                          fill
                          sizes="(min-width: 1024px) 28vw, 90vw"
                          className="best-sellers-image"
                        />
                        <span className="best-sellers-view">
                          <span className="best-sellers-view-ring">
                            <svg viewBox="0 0 200 200" aria-hidden="true">
                              <defs>
                                <path
                                  id={`bestSellerViewPath-${item.key}`}
                                  d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"
                                />
                              </defs>
                              <text className="best-sellers-view-type">
                                <textPath href={`#bestSellerViewPath-${item.key}`}>{VIEW_COPY}</textPath>
                              </text>
                            </svg>
                          </span>
                          <IconStarBurst className="best-sellers-view-star" />
                        </span>
                      </Link>
                      <form action={toggleWishlistAction} className="best-sellers-heart-form">
                        <input type="hidden" name="productId" value={item.productId} />
                        <button
                          type="submit"
                          className={cn("product-card-wishlist", item.wished && "is-active")}
                          aria-label={item.wished ? `Remove ${item.title} from wishlist` : `Add ${item.title} to wishlist`}
                          aria-pressed={item.wished}
                        >
                          <IconHeart />
                        </button>
                      </form>
                    </div>
                    <AddToBagForm productId={item.productId} className="product-quick-add">
                      <button type="submit" className="product-quick-add-btn" aria-label={`Add ${item.title} to bag`}>
                        <IconPlus />
                      </button>
                    </AddToBagForm>
                  </div>
                  <h3 className="best-sellers-name">{item.title}</h3>
                  <p className="best-sellers-desc">{item.description}</p>
                  <p className="best-sellers-price">{formatMoney(item.price, currency)}</p>
                </article>
              ))}
            </div>
            <div className="best-sellers-actions">
              <Link href={BEST_SELLERS_CTA_HREF} className="best-sellers-cta">
                {BEST_SELLERS_CTA}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
