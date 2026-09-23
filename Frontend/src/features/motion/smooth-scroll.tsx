"use client";

import "lenis/dist/lenis.css";

import Lenis from "lenis";
import { useEffect } from "react";

import { gsap, isDesktopFinePointer, prefersReducedMotion, registerGsapPlugins, ScrollTrigger } from "@/features/motion/motion-config";

const DESKTOP_MQ = "(min-width: 768px) and (pointer: fine)";
const REDUCED_MQ = "(prefers-reduced-motion: reduce)";

/**
 * Desktop Lenis smooth scroll driven by the GSAP ticker (single RAF owner).
 * Contract baseline: lerp 0.06, wheelMultiplier 1.1.
 */
export function SmoothScroll() {
  useEffect(() => {
    registerGsapPlugins();

    const desktop = window.matchMedia(DESKTOP_MQ);
    const reduced = window.matchMedia(REDUCED_MQ);

    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    let unbindAnchors: (() => void) | undefined;

    const stop = () => {
      unbindAnchors?.();
      unbindAnchors = undefined;
      if (tickerFn) {
        gsap.ticker.remove(tickerFn);
        tickerFn = null;
      }
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      document.documentElement.classList.remove("has-smooth-scroll");
      ScrollTrigger.refresh();
    };

    const bindAnchors = (instance: Lenis) => {
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

        if (!targetId) {
          return;
        }
        const target = document.getElementById(targetId);
        if (!target) {
          return;
        }

        event.preventDefault();
        instance.scrollTo(target, {
          offset: -88,
          duration: 0.85,
          easing: (value) => 1 - Math.pow(1 - value, 3),
        });
      };

      document.addEventListener("click", onAnchorClick);
      return () => document.removeEventListener("click", onAnchorClick);
    };

    const start = () => {
      stop();
      if (!desktop.matches || reduced.matches || !isDesktopFinePointer() || prefersReducedMotion()) {
        return;
      }

      lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        smoothWheel: true,
        autoRaf: false,
        syncTouch: false,
      });

      lenis.on("scroll", ScrollTrigger.update);

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      // Absorb small frame spikes so scroll does not feel stuck.
      gsap.ticker.lagSmoothing(500, 33);

      document.documentElement.classList.add("has-smooth-scroll");
      unbindAnchors = bindAnchors(lenis);
      ScrollTrigger.refresh();
    };

    const sync = () => {
      start();
    };

    sync();
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
