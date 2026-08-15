"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { HERO_SLIDES } from "@/constants/site";

const DELAY = 5000;
const SWIPE = 50;

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
  }, []);
  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(goNext, DELAY);
    return () => window.clearInterval(id);
  }, [goNext]);

  return (
    <section
      className="lux-hero"
      aria-label="Featured skincare highlights"
      aria-roledescription="carousel"
      onTouchStart={(event) => {
        startX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (startX.current === null) {
          return;
        }
        const endX = event.changedTouches[0]?.clientX ?? startX.current;
        const delta = startX.current - endX;
        if (Math.abs(delta) > SWIPE) {
          if (delta > 0) {
            goNext();
          } else {
            goPrev();
          }
        }
        startX.current = null;
      }}
    >
      <div className="lux-hero-media" aria-hidden="true">
        <div className={`lux-hero-track lux-hero-track--${activeIndex}`}>
          {HERO_SLIDES.map((slide, index) => (
            <div key={slide.id} className="lux-hero-slide">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="lux-hero-slide-image is-loaded object-cover"
              />
            </div>
          ))}
        </div>
        <div className="lux-hero-overlay" />
      </div>
    </section>
  );
}
