import Link from "next/link";

import { brandName } from "@/constants/brand";
import type { StorefrontContent } from "@/constants/storefront";

function FaqArrow() {
  return (
    <svg className="home-faq-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8h9M8.5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FaqUnderline() {
  return (
    <svg className="home-faq-underline" viewBox="0 0 220 28" fill="none" aria-hidden="true">
      <path
        d="M6 16c28-10 54-14 84-8 24 5 44 10 70 6 18-3 36-10 54-14"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeFaq({ content }: { content: StorefrontContent }) {
  return (
    <section className="home-faq" aria-labelledby="home-faq-title">
      <div className="home-faq-inner">
        <div className="home-faq-intro">
          <h2 id="home-faq-title" className="home-faq-title">
            Frequently Asked{" "}
            <span className="home-faq-title-mark">
              Questions
              <span className="home-faq-dot" aria-hidden="true" />
              <FaqUnderline />
            </span>
          </h2>
          <p className="home-faq-lead">
            Everything you need to know about {brandName} gear, orders and getting started. We&apos;re here to make
            shopping for your horse easy.
          </p>
          <Link href="/faq" className="home-faq-cta">
            <span>See all questions</span>
            <span className="home-faq-cta-icon">
              <FaqArrow />
            </span>
          </Link>
        </div>
        <div className="home-faq-list">
          {content.faqItems.map((item, index) => (
            <details key={`${item.id}-${index}`} className="home-faq-item" name="zermae-home-faq">
              <summary className="home-faq-question">
                <span>{item.question}</span>
                <span className="home-faq-toggle" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="home-faq-answer">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
