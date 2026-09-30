"use client";

import { type RefObject, useEffect, useRef } from "react";

import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/features/motion/motion-config";

export function useHeaderBrandTimeline(
  rootRef: RefObject<HTMLElement | null>,
  compact: boolean,
  enabled: boolean,
): void {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || prefersReducedMotion()) {
      timelineRef.current?.kill();
      timelineRef.current = null;
      return;
    }

    registerGsapPlugins();
    const crest = root.querySelector(".header-brand-crest");
    const type = root.querySelector(".header-brand-type");
    if (!(crest instanceof HTMLElement) || !(type instanceof HTMLElement)) {
      return;
    }

    const tl = gsap.timeline({ paused: true });
    gsap.set(crest, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 });
    gsap.set(type, { clipPath: "inset(0 50% 0 50%)", opacity: 0 });
    tl.to(crest, { clipPath: "inset(0 50% 0 50%)", opacity: 0, duration: 0.7, ease: "power2.inOut" }, 0);
    tl.to(type, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 0.7, ease: "power2.out" }, 0.4);
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
      gsap.set(crest, { clearProps: "clipPath,opacity" });
      gsap.set(type, { clearProps: "clipPath,opacity" });
    };
  }, [rootRef, enabled]);

  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl || !enabled) {
      return;
    }
    if (compact) {
      tl.play();
    } else {
      tl.reverse();
    }
  }, [compact, enabled]);
}
