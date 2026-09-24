"use client";

import { useEffect } from "react";

import {
  gsap,
  isCoarsePointer,
  isMobileViewport,
  prefersReducedMotion,
  registerGsapPlugins,
  ScrollTrigger,
} from "@/features/motion/motion-config";

const SESSION_KEY = "saddlera-hero-seen";

/**
 * M01 coordinated hero entrance + M02 scroll retreat.
 * Separate wrappers: .home-hero-entrance (decor scale), .home-hero-scroll (scroll).
 * Mobile / coarse / reduced-motion: CSS-visible hero, no GSAP intro.
 */
export function useHeroMotion() {
  useEffect(() => {
    registerGsapPlugins();
    const root = document.querySelector(".home-flow");
    if (!(root instanceof HTMLElement)) {
      return;
    }

    const hero = root.querySelector(".home-hero");
    const scrollWrap = root.querySelector(".home-hero-scroll");
    const entrance = root.querySelector(".home-hero-entrance");
    const wordLines = root.querySelectorAll(".home-hero-wordmark-line");
    const subject = root.querySelector(".home-hero-subject-motion") ?? root.querySelector(".home-hero-subject");
    const cta = root.querySelector(".home-hero-cta-wrap");
    const decor = root.querySelectorAll(".home-hero-decor, .home-hero-accent-dot");

    if (!(hero instanceof HTMLElement) || !(scrollWrap instanceof HTMLElement)) {
      root.classList.add("is-hero-ready");
      return;
    }

    document.documentElement.classList.add("home-motion-ready");

    const reduced = prefersReducedMotion();
    const mobile = isMobileViewport();
    const coarse = isCoarsePointer();

    // Phones / touch / a11y: keep CSS defaults visible; skip the GSAP intro entirely.
    if (reduced || mobile || coarse) {
      root.classList.add("is-hero-ready");
      return;
    }

    let repeat = false;
    try {
      repeat = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      repeat = false;
    }

    let removeEarlyScroll: (() => void) | undefined;

    const ctx = gsap.context(() => {
      // Mild entrance only — never hide subject/CTA at 0 / 0.35 (FOUC risk on slow JS).
      if (entrance) {
        gsap.set(entrance, { scale: 0.92, opacity: 0.85, transformOrigin: "50% 50%" });
      }
      gsap.set(wordLines, { yPercent: 110 });
      if (subject) {
        gsap.set(subject, { y: 16, scale: 1.01 });
      }
      if (cta) {
        gsap.set(cta, { y: 10 });
      }

      const durationScale = repeat ? 0.4 : 0.72;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          root.classList.add("is-hero-ready");
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
        },
      });

      if (entrance) {
        tl.to(entrance, { scale: 1, opacity: 1, duration: 0.85 * durationScale, ease: "power4.out" }, 0);
      }
      if (decor.length) {
        tl.to(decor, { opacity: 1, duration: 0.55 * durationScale }, 0.05);
      }
      tl.to(
        wordLines,
        {
          yPercent: 0,
          duration: 0.55 * durationScale,
          stagger: 0.05,
          ease: "revealEase",
        },
        0.08 * durationScale,
      );
      if (subject) {
        tl.to(
          subject,
          { y: 0, scale: 1, duration: 0.55 * durationScale, ease: "power3.out" },
          0.06 * durationScale,
        );
      }
      if (cta) {
        tl.to(cta, { y: 0, duration: 0.4 * durationScale, ease: "power2.out" }, 0.22 * durationScale);
      }

      let interrupted = false;
      const settleIntro = () => {
        if (interrupted) {
          return;
        }
        interrupted = true;
        tl.progress(1);
        root.classList.add("is-hero-ready");
      };

      const onEarlyScroll = () => {
        if (window.scrollY > 8) {
          settleIntro();
          window.removeEventListener("scroll", onEarlyScroll);
        }
      };
      window.addEventListener("scroll", onEarlyScroll, { passive: true });
      removeEarlyScroll = () => window.removeEventListener("scroll", onEarlyScroll);

      const scene = scrollWrap.querySelector(".home-hero-panel") ?? scrollWrap;
      gsap.fromTo(
        scene,
        { scale: 1, opacity: 1 },
        {
          scale: 0.8,
          opacity: 0.9,
          ease: "none",
          transformOrigin: "50% 100%",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=700",
            scrub: 0.55,
            pin: false,
            onUpdate: (self) => {
              if (self.progress > 0.02) {
                settleIntro();
              }
            },
          },
        },
      );

      const media = scrollWrap.querySelector(".home-hero-subject-motion") ?? scrollWrap.querySelector(".home-hero-subject");
      const wordmark = scrollWrap.querySelector(".home-hero-wordmark");
      if (wordmark) {
        gsap.to(wordmark, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=700",
            scrub: 0.55,
          },
        });
      }
      if (media) {
        gsap.to(media, {
          y: 48,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=700",
            scrub: 0.7,
          },
        });
      }
      if (entrance) {
        gsap.to(entrance, {
          y: -40,
          rotate: 2,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=700",
            scrub: 1.2,
          },
        });
      }
    }, root);

    // Height-only resizes are the mobile URL bar, not a layout change.
    let lastWidth = window.innerWidth;
    let resizeTimer = 0;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      removeEarlyScroll?.();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);
}
