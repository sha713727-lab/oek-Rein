"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BEST_SELLERS_CTA, BEST_SELLERS_CTA_HREF } from "@/constants/site";
import { CatalogEmptyState } from "@/features/catalog/catalog-empty-state";
import { ProductCard } from "@/features/catalog/product-card";
import type { ResolvedBestSeller } from "@/features/catalog/resolve-best-sellers";
import { PillCta } from "@/features/motion/pill-cta";

const BEST_SELLERS_LIMIT = 3;

/** M09 — outer peek rail around ProductCard (card internals untouched). */
export function BestSellers({ items, currency = "PKR" }: { items: ResolvedBestSeller[]; currency?: string }) {
  const products = items.slice(0, BEST_SELLERS_LIMIT);
  const empty = products.length === 0;
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    origin: 0,
    moved: false,
    axis: null as null | "x" | "y",
    pointerId: -1,
  });

  const maxIndex = Math.max(0, products.length - 1);

  const cardStep = useCallback(() => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".vd-card-entrance");
    if (!card || !track) {
      return 320;
    }
    const style = window.getComputedStyle(track);
    const gap = Number.parseFloat(style.columnGap || style.gap || "24") || 24;
    return card.getBoundingClientRect().width + gap;
  }, []);

  const applyTransform = useCallback(
    (next: number, animate = true) => {
      const clamped = Math.max(0, Math.min(maxIndex, next));
      const track = trackRef.current;
      if (!track) {
        return clamped;
      }
      const x = -clamped * cardStep();
      track.style.transition = animate ? "transform 400ms ease" : "none";
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      return clamped;
    },
    [cardStep, maxIndex],
  );

  const goTo = useCallback(
    (next: number, animate = true) => {
      setIndex(applyTransform(next, animate));
    },
    [applyTransform],
  );

  useEffect(() => {
    applyTransform(index, false);
    const onResize = () => applyTransform(index, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyTransform, index, products.length]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || empty) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      dragRef.current = {
        active: true,
        startX: event.clientX,
        startY: event.clientY,
        origin: index * cardStep(),
        moved: false,
        axis: null,
        pointerId: event.pointerId,
      };
      const track = trackRef.current;
      if (track) {
        track.style.transition = "none";
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active) {
        return;
      }
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
          return;
        }
        drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (drag.axis === "y") {
          // Vertical intent belongs to the page — never capture it.
          drag.active = false;
          return;
        }
        viewport.classList.add("is-dragging");
        viewport.setPointerCapture(drag.pointerId);
      }
      if (drag.axis !== "x") {
        return;
      }
      event.preventDefault();
      drag.moved = Math.abs(dx) > 8;
      const track = trackRef.current;
      if (track) {
        track.style.transform = `translate3d(${-(drag.origin - dx)}px, 0, 0)`;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active && drag.axis !== "x") {
        viewport.classList.remove("is-dragging");
        return;
      }
      drag.active = false;
      viewport.classList.remove("is-dragging");
      const dx = event.clientX - drag.startX;
      const threshold = window.matchMedia("(max-width: 767px)").matches ? 40 : 20;
      let next = index;
      if (drag.moved && Math.abs(dx) > threshold) {
        next = dx < 0 ? index + 1 : index - 1;
      }
      goTo(next, true);

      if (drag.moved) {
        const blockClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          viewport.removeEventListener("click", blockClick, true);
        };
        viewport.addEventListener("click", blockClick, true);
      }
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);

    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
    };
  }, [cardStep, empty, goTo, index]);

  return (
    <section className="best-sellers" aria-labelledby="best-sellers-title">
      <div className="best-sellers-wash vd-parallax-a" aria-hidden="true" />
      <div className="best-sellers-blob best-sellers-blob--mint vd-parallax-b" aria-hidden="true" />
      <div className="best-sellers-blob best-sellers-blob--blush vd-parallax-c" aria-hidden="true" />
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
            <div className="best-sellers-rail">
              <div className="best-sellers-rail-controls">
                <button
                  type="button"
                  className="best-sellers-rail-btn"
                  aria-label="Previous products"
                  disabled={index <= 0}
                  onClick={() => goTo(index - 1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="best-sellers-rail-btn"
                  aria-label="Next products"
                  disabled={index >= maxIndex}
                  onClick={() => goTo(index + 1)}
                >
                  ›
                </button>
              </div>
              <div
                ref={viewportRef}
                className="best-sellers-rail-viewport"
                data-cursor-drag
                role="region"
                aria-roledescription="carousel"
                aria-label="Best sellers"
              >
                <div
                  ref={trackRef}
                  className={`best-sellers-rail-track${products.length <= 3 ? " is-centered" : ""}`}
                >
                  {products.map((item) => (
                    <div key={item.key} className="vd-card-entrance">
                      <ProductCard
                        wished={item.wished}
                        currency={currency}
                        ctaLabel="Shop"
                        product={{
                          id: item.productId,
                          title: item.title,
                          description: item.description,
                          price: item.price,
                          images: item.image ? [item.image] : [],
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="best-sellers-actions">
              <PillCta href={BEST_SELLERS_CTA_HREF} className="best-sellers-cta">
                {BEST_SELLERS_CTA}
              </PillCta>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
