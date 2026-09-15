"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import "lenis/dist/lenis.css";

const DESKTOP_MQ = "(min-width: 768px) and (pointer: fine)";
const REDUCED_MQ = "(prefers-reduced-motion: reduce)";

/**
 * Lightweight Lenis smooth scroll for desktop.
 * Tuned snappy (higher lerp) so it doesn’t feel like laggy rubber-banding.
 */
export function SmoothScroll() {
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_MQ);
    const reduced = window.matchMedia(REDUCED_MQ);

    let lenis: Lenis | null = null;

    const stop = () => {
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      document.documentElement.classList.remove("has-smooth-scroll");
    };

    const start = () => {
      stop();
      if (!desktop.matches || reduced.matches) {
        return;
      }

      lenis = new Lenis({
        // Higher lerp = more responsive, less “float behind” lag.
        lerp: 0.14,
        wheelMultiplier: 0.95,
        touchMultiplier: 1,
        smoothWheel: true,
        autoRaf: true,
        syncTouch: false,
      });

      document.documentElement.classList.add("has-smooth-scroll");

      const onAnchorClick = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        const link = (event.target as Element | null)?.closest?.("a[href]");
        if (!link || link.hasAttribute("data-no-smooth")) {
          return;
        }

        const href = link.getAttribute("href");
        if (!href || href === "#") {
          return;
        }

        let targetId: string | null = null;
        try {
          if (href.startsWith("#")) {
            targetId = href.slice(1);
          } else {
            const url = new URL(href, window.location.href);
            const current = window.location.pathname.replace(/\/+$/, "");
            const next = url.pathname.replace(/\/+$/, "");
            if (current !== next) {
              return;
            }
            targetId = url.hash ? url.hash.slice(1) : null;
          }
        } catch {
          return;
        }

        if (!targetId || !lenis) {
          return;
        }
        const target = document.getElementById(targetId);
        if (!target) {
          return;
        }

        event.preventDefault();
        lenis.scrollTo(target, {
          offset: -88,
          duration: 0.85,
          easing: (value) => 1 - Math.pow(1 - value, 3),
        });
      };

      document.addEventListener("click", onAnchorClick);

      return () => {
        document.removeEventListener("click", onAnchorClick);
      };
    };

    let unbindAnchors: (() => void) | undefined;
    const sync = () => {
      unbindAnchors?.();
      unbindAnchors = start() ?? undefined;
    };

    sync();
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      unbindAnchors?.();
      stop();
    };
  }, []);

  return null;
}
