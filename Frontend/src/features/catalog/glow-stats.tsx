import Image from "next/image";
import Link from "next/link";

import {
  GLOW_STATS,
  GLOW_STATS_ALT,
  GLOW_STATS_COPY,
  GLOW_STATS_CTA,
  GLOW_STATS_CTA_HREF,
  GLOW_STATS_IMAGE,
  GLOW_STATS_TITLE,
} from "@/constants/site";

function StatBlob({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 180 120" fill="none" aria-hidden="true">
      <path
        d="M18 68c6-28 28-52 62-54 38-2 64 18 78 42 12 22 8 42-18 52-24 10-58 8-86-4C26 92 12 84 18 68Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function GlowStats() {
  return (
    <section className="glow-stats" aria-labelledby="glow-stats-title">
      <div className="glow-stats-inner">
        <div className="glow-stats-copy">
          <h2 id="glow-stats-title" className="glow-stats-title">
            {GLOW_STATS_TITLE}
          </h2>
          <p className="glow-stats-lead">{GLOW_STATS_COPY}</p>
          <ul className="glow-stats-metrics">
            {GLOW_STATS.map((stat, index) => (
              <li key={stat.id} className={`glow-stats-metric glow-stats-metric--${index + 1}`}>
                <StatBlob className="glow-stats-blob" />
                <strong className="glow-stats-value">{stat.value}</strong>
                <span className="glow-stats-label">{stat.label}</span>
              </li>
            ))}
          </ul>
          <Link href={GLOW_STATS_CTA_HREF} className="glow-stats-cta">
            {GLOW_STATS_CTA}
          </Link>
        </div>
        <figure className="glow-stats-stage">
          <div className="glow-stats-pill">
            <Image
              src={GLOW_STATS_IMAGE}
              alt={GLOW_STATS_ALT}
              width={480}
              height={900}
              className="glow-stats-cutout"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
