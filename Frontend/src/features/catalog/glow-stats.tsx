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
import { CmsImage } from "@/features/media/cms-image";

export function GlowStats({ image }: { image: string }) {
  return (
    <section className="glow-stats" aria-labelledby="glow-stats-title">
      <div className="glow-stats-inner">
        <div className="glow-stats-copy">
          <h2 id="glow-stats-title" className="glow-stats-title">
            {GLOW_STATS_TITLE}
          </h2>
          <p className="glow-stats-lead">{GLOW_STATS_COPY}</p>
          <ul className="glow-stats-metrics">
            {GLOW_STATS.map((stat) => (
              <li key={stat.id} className="glow-stats-metric">
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
          <div className="glow-stats-pill" aria-hidden="true" />
          <CmsImage
            src={image || GLOW_STATS_IMAGE}
            alt={GLOW_STATS_ALT}
            width={234}
            height={606}
            priority
            sizes="(max-width: 899px) 16.5rem, 21rem"
            className="glow-stats-cutout"
          />
        </figure>
      </div>
    </section>
  );
}
