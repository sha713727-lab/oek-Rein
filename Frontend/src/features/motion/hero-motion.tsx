"use client";

import { useEffect } from "react";

import {
  gsap,
  isMobileViewport,
  prefersReducedMotion,
  registerGsapPlugins,
  ScrollTrigger,
} from "@/features/motion/motion-config";

const SESSION_KEY = "saddlera-hero-seen";

/**
 * M01 coordinated hero entrance + M02 scroll retreat.
 * Separate wrappers: .home-hero-entrance (decor scale), .home-hero-scroll (scroll).
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
    let repeat = false;
    try {
      repeat = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      repeat = false;
    }

    let removeEarlyScroll: (() => void) | undefined;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([entrance, wordLines, subject, cta, decor].filter(Boolean), { clearProps: "all" });
        root.classList.add("is-hero-ready");
        return;
      }

      if (entrance) {
        gsap.set(entrance, { scale: 0.85, opacity: 0.4, transformOrigin: "50% 50%" });
      }
      gsap.set(wordLines, { yPercent: 110, opacity: 0 });
      if (subject) {
        gsap.set(subject, { y: 36, scale: 1.04, opacity: 0 });
      }
      if (cta) {
        gsap.set(cta, { y: 18, opacity: 0 });
      }

      const durationScale = repeat ? 0.55 : 1;
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
        tl.to(entrance, { scale: 1, opacity: 1, duration: 1.2 * durationScale, ease: "power4.out" }, 0);
      }
      if (decor.length) {
        tl.to(decor, { opacity: 1, duration: 0.8 * durationScale }, 0.1);
      }
      tl.to(
        wordLines,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8 * durationScale,
          stagger: 0.08,
          ease: "revealEase",
        },
        0.18 * durationScale,
      );
      if (subject) {
        tl.to(
          subject,
          { y: 0, scale: 1, opacity: 1, duration: 0.95 * durationScale, ease: "power3.out" },
          0.26 * durationScale,
        );
      }
      if (cta) {
        tl.to(cta, { y: 0, opacity: 1, duration: 0.55 * durationScale, ease: "power2.out" }, 0.48 * durationScale);
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

      if (!mobile) {
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
              // Pin only when layout measurement warrants it — default off.
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
      } else {
        const panel = scrollWrap.querySelector(".home-hero-panel");
        if (panel) {
          gsap.to(panel, {
            scale: 0.94,
            opacity: 0.95,
            ease: "none",
            transformOrigin: "50% 100%",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "+=280",
              scrub: true,
            },
          });
        }
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
