import Link from "next/link";

import {
  DEFAULT_DISCIPLINES_SECTION,
  type StorefrontDisciplinesSection,
} from "@/constants/storefront";
import { PillCta } from "@/features/motion/pill-cta";

type CraftedForEveryRideProps = {
  content?: StorefrontDisciplinesSection;
};

/** Homepage disciplines section — content guides, not empty product grids. */
export function CraftedForEveryRide({ content = DEFAULT_DISCIPLINES_SECTION }: CraftedForEveryRideProps) {
  const data = content ?? DEFAULT_DISCIPLINES_SECTION;

  return (
    <section className="features-section home-disciplines" aria-labelledby="disciplines-title">
      <div className="features-inner">
        <header className="features-header">
          <h2 id="disciplines-title" className="features-heading">
            {data.title} <span className="section-mark">{data.titleMark}</span>
          </h2>
          <p className="features-support">{data.support}</p>
        </header>
        <ul className="features-grid">
          {data.items.map((item) => (
            <li key={item.id} className="feature-item">
              <h3 className="feature-title">
                <Link href={item.href}>{item.title}</Link>
              </h3>
              <p className="feature-desc">{item.description}</p>
              <p className="feature-desc">
                <Link href={item.href}>{item.cta}</Link>
              </p>
            </li>
          ))}
        </ul>
        <div className="best-sellers-actions" style={{ marginTop: "2rem" }}>
          <PillCta href={data.ctaHref} className="best-sellers-cta">
            {data.ctaLabel}
          </PillCta>
        </div>
      </div>
    </section>
  );
}
