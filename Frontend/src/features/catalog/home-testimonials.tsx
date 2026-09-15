"use client";

import { useCallback, useId, useRef } from "react";

import {
  HOME_TESTIMONIALS,
  HOME_TESTIMONIALS_BADGE,
  HOME_TESTIMONIALS_COUNT,
  HOME_TESTIMONIALS_HEADLINE,
  HOME_TESTIMONIALS_RATING,
  HOME_TESTIMONIALS_RIBBON,
} from "@/constants/site";
import { TestimonialsCurves } from "@/features/catalog/testimonials-curves";

function Stars({ value }: { value: number }) {
  return (
    <span className="home-testimonials-stars" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < value ? "is-on" : undefined} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

function Sparkles() {
  return (
    <svg className="home-testimonials-sparkles" viewBox="0 0 48 36" fill="none" aria-hidden="true">
      <path d="M10 28 L16 8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M24 30 L28 6" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M36 26 L44 10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function DownArrow() {
  return (
    <svg className="home-testimonials-down" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v12.5M6.5 12.5 12 18l5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d={dir === "prev" ? "M12 4.5 6.5 10 12 15.5" : "M8 4.5 13.5 10 8 15.5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReviewRibbon({ text }: { text: string }) {
  const rawId = useId();
  const pathId = `testimonial-ribbon-${rawId.replace(/:/g, "")}`;
  /* Soft S-curve: enters mid-left, dips under copy, rises out to the right. */
  const guide = "M-80,70 C200,10 400,190 720,115 C1020,45 1240,185 1520,75";
  const copy = `${text}  ·  `.repeat(12);

  return (
    <div className="home-testimonials-ribbon" aria-hidden="true">
      <svg
        className="home-testimonials-ribbon-svg"
        viewBox="0 0 1440 240"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <path id={pathId} d={guide} fill="none" />
        </defs>
        <use href={`#${pathId}`} className="home-testimonials-ribbon-band" strokeWidth="64" />
        <text className="home-testimonials-ribbon-type">
          <textPath href={`#${pathId}`} startOffset="2%" dominantBaseline="middle">
            {copy}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export function HomeTestimonials() {
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollByCard = useCallback((dir: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const card = viewport.querySelector<HTMLElement>(".home-testimonials-card");
    const step = (card?.offsetWidth ?? viewport.clientWidth * 0.8) + 20;
    viewport.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <section className="home-testimonials" aria-labelledby="home-testimonials-title">
      <TestimonialsCurves />
      <div className="home-testimonials-intro">
        <ReviewRibbon text={HOME_TESTIMONIALS_RIBBON} />
        <p className="home-testimonials-badge">{HOME_TESTIMONIALS_BADGE}</p>
        <div className="home-testimonials-headline-wrap">
          <h2 id="home-testimonials-title" className="home-testimonials-headline">
            {HOME_TESTIMONIALS_HEADLINE}
          </h2>
          <Sparkles />
        </div>
        <DownArrow />
      </div>

      <div className="home-testimonials-carousel">
        <button
          type="button"
          className="home-testimonials-nav home-testimonials-nav--prev"
          aria-label="Previous reviews"
          onClick={() => scrollByCard(-1)}
        >
          <Chevron dir="prev" />
        </button>

        <div ref={viewportRef} className="home-testimonials-viewport" tabIndex={0}>
          <ul className="home-testimonials-track">
            {HOME_TESTIMONIALS.map((item) => (
              <li key={item.id} className="home-testimonials-card">
                <header className="home-testimonials-card-head">
                  <span className="home-testimonials-avatar" style={{ background: item.tone }}>
                    {item.initials}
                  </span>
                  <div className="home-testimonials-meta">
                    <p className="home-testimonials-name">{item.name}</p>
                    <p className="home-testimonials-when">{item.when}</p>
                  </div>
                </header>
                <Stars value={item.rating} />
                <p className="home-testimonials-body">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="home-testimonials-nav home-testimonials-nav--next"
          aria-label="Next reviews"
          onClick={() => scrollByCard(1)}
        >
          <Chevron dir="next" />
        </button>
      </div>

      <div className="home-testimonials-summary">
        <p className="home-testimonials-score">
          <span>{HOME_TESTIMONIALS_RATING.toFixed(1)}</span>
          <Stars value={5} />
        </p>
        <p className="home-testimonials-count">Based on {HOME_TESTIMONIALS_COUNT} reviews</p>
        <p className="home-testimonials-powered">Loved by the Saddlera community</p>
      </div>
    </section>
  );
}
