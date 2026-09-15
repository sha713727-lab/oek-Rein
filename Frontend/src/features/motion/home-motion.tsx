"use client";

import { useEffect } from "react";

/** Section-level reveals only — avoids animating dozens of cards at once. */
const REVEAL_SELECTORS = [
  ".ritual-finder",
  ".shop-range",
  ".best-sellers",
  ".product-highlights",
  ".brand-story",
  ".features-section",
  ".home-testimonials",
  ".home-faq",
  ".glow-stats",
].join(", ");

/**
 * Lightweight homepage motion: one-shot section fade-ups + hero entrance.
 * No continuous scroll-linked transforms (those felt laggy with Lenis).
 */
export function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector(".home-flow");
    if (!(root instanceof HTMLElement)) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("home-motion-ready");

    if (reduced) {
      root.querySelectorAll(REVEAL_SELECTORS).forEach((node) => {
        node.classList.add("is-revealed");
      });
      root.classList.add("is-hero-ready");
      return;
    }

    const heroReady = window.setTimeout(() => {
      root.classList.add("is-hero-ready");
    }, 40);

    const revealNodes = [...root.querySelectorAll(REVEAL_SELECTORS)];
    revealNodes.forEach((node) => node.classList.add("home-reveal"));

    let observer: IntersectionObserver | null = null;

    const markRevealed = (node: Element) => {
      node.classList.add("is-revealed");
      observer?.unobserve(node);
    };

    const isPastFold = (node: Element) => node.getBoundingClientRect().top < window.innerHeight * 0.92;

    observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
                  markRevealed(entry.target);
                }
              }
            },
            { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
          );

    if (observer) {
      revealNodes.forEach((node) => {
        if (isPastFold(node)) {
          markRevealed(node);
          return;
        }
        observer?.observe(node);
      });
    } else {
      revealNodes.forEach((node) => node.classList.add("is-revealed"));
    }

    return () => {
      window.clearTimeout(heroReady);
      observer?.disconnect();
      document.documentElement.classList.remove("home-motion-ready");
    };
  }, []);

  return null;
}
