"use client";

import { useEffect } from "react";

import { useCardEntrances } from "@/features/motion/card-entrances";
import { useDrawAndParallax } from "@/features/motion/draw-parallax";
import { useHeadingReveals } from "@/features/motion/heading-reveals";
import { useHeroMotion } from "@/features/motion/hero-motion";
import { prefersReducedMotion, registerGsapPlugins, ScrollTrigger } from "@/features/motion/motion-config";

/**
 * Homepage motion orchestrator — mounts GSAP scenes once on .home-flow.
 */
export function HomeMotion() {
  useHeroMotion();
  useHeadingReveals();
  useDrawAndParallax();
  useCardEntrances();

  useEffect(() => {
    registerGsapPlugins();
    document.documentElement.classList.add("home-motion-ready");

    const root = document.querySelector(".home-flow");
    if (root instanceof HTMLElement && prefersReducedMotion()) {
      root.classList.add("is-hero-ready");
    }

    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduced = () => {
      refresh();
      if (reduced.matches && root instanceof HTMLElement) {
        root.classList.add("is-hero-ready");
      }
    };
    reduced.addEventListener("change", onReduced);

    return () => {
      window.removeEventListener("load", refresh);
      reduced.removeEventListener("change", onReduced);
      document.documentElement.classList.remove("home-motion-ready");
    };
  }, []);

  return null;
}
