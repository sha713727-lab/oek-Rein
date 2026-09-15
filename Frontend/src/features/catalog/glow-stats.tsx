import Link from "next/link";

import {
  GLOW_STATS_ALT,
  GLOW_STATS_COPY,
  GLOW_STATS_CTA,
  GLOW_STATS_CTA_HREF,
  GLOW_STATS_TITLE,
} from "@/constants/site";
import { GlowStatsCurves } from "@/features/catalog/glow-stats-curves";
import { CmsImage } from "@/features/media/cms-image";

export function GlowStats({ image }: { image: string }) {
  return (
    <section className="glow-stats" aria-labelledby="glow-stats-title">
      <GlowStatsCurves />
      <div className="glow-stats-media" aria-hidden={!image}>
        {image ? (
          <CmsImage
            src={image}
            alt={GLOW_STATS_ALT}
            fill
            priority
            sizes="100vw"
            className="glow-stats-image"
          />
        ) : null}
        <span className="glow-stats-veil" />
      </div>
      <div className="glow-stats-inner">
        <div className="glow-stats-copy">
          <h2 id="glow-stats-title" className="glow-stats-title">
            <span className="section-mark">{GLOW_STATS_TITLE}</span>
          </h2>
          <p className="glow-stats-lead">{GLOW_STATS_COPY}</p>
        </div>
        <Link href={GLOW_STATS_CTA_HREF} className="glow-stats-cta">
          {GLOW_STATS_CTA}
        </Link>
      </div>
    </section>
  );
}
