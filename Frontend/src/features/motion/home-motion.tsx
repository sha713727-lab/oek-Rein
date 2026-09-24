"use client";

import { useEffect, useState } from "react";

import { useCardEntrances } from "@/features/motion/card-entrances";
import { useDrawAndParallax } from "@/features/motion/draw-parallax";
import { useHeadingReveals } from "@/features/motion/heading-reveals";
import { useHeroMotion } from "@/features/motion/hero-motion";
import { prefersReducedMotion, registerGsapPlugins, ScrollTrigger } from "@/features/motion/motion-config";

function DeferredHomeScenes() {
  useHeadingReveals();
  useDrawAndParallax();
  useCardEntrances();
  return null;
}

/**
 * Homepage motion orchestrator — hero runs immediately; heavier scroll scenes
 * wait for an idle slot so first paint / hero video aren't competing for the main thread.
 */
export function HomeMotion() {
  useHeroMotion();
  const [defer, setDefer] = useState(false);

  useEffect(() => {
    registerGsapPlugins();
    document.documentElement.classList.add("home-motion-ready");

    const root = document.querySelector(".home-flow");
    if (root instanceof HTMLElement && prefersReducedMotion()) {
      root.classList.add("is-hero-ready");
    }

    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduced = () => {
      refresh();
      if (reduced.matches && root instanceof HTMLElement) {
        root.classList.add("is-hero-ready");
      }
    };
    reduced.addEventListener("change", onReduced);

    let idleId = 0;
    let timeoutId = 0;
    const arm = () => setDefer(true);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(arm, { timeout: 900 });
    } else {
      timeoutId = window.setTimeout(arm, 200);
    }

    return () => {
      reduced.removeEventListener("change", onReduced);
      document.documentElement.classList.remove("home-motion-ready");
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return defer ? <DeferredHomeScenes /> : null;
}
