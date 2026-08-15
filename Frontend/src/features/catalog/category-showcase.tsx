import Link from "next/link";

import { SHOWCASE_CATEGORIES } from "@/constants/site";

export function CategoryShowcase({ heading }: { heading: string }) {
  return (
    <section className="category-showcase" aria-label="Featured skincare">
      <div className="category-showcase-intro">
        <h2 className="category-showcase-heading">{heading}</h2>
      </div>
      <div className="category-showcase-stack">
        {SHOWCASE_CATEGORIES.map((category, index) => (
          <article
            key={category.id}
            className={`category-card category-card--${category.layout} category-card--index-${index + 1}`}
            aria-labelledby={`category-title-${category.id}`}
          >
            <div className="category-card-sticky">
              <div className="category-card-inner">
                <picture className="category-card-picture">
                  <source srcSet={category.webp} type="image/webp" />
                  <img src={category.jpg} alt={category.alt} className="category-card-image" />
                </picture>
                <div className="category-card-overlay" aria-hidden="true" />
                <div className={`category-card-content category-card-content--${category.layout}`}>
                  <h2 id={`category-title-${category.id}`} className="category-card-title">
                    {category.title}
                  </h2>
                  <p className="category-card-description">{category.description}</p>
                  <Link href={category.href} className="category-shop-btn category-shop-btn--dark">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
            {index === SHOWCASE_CATEGORIES.length - 1 ? <div className="category-card-spacer" aria-hidden="true" /> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
