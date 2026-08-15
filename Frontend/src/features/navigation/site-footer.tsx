import Link from "next/link";
import type { ComponentType } from "react";

import { IconFacebook, IconInstagram, IconPinterest, IconSparkle } from "@/components/icons/icons";
import {
  brandName,
  footerSocialLabel,
  footerStatementEnd,
  footerStatementLead,
  heroCtaHref,
  heroExploreLabel,
} from "@/constants/brand";
import { FOOTER_SOCIAL } from "@/constants/site";

type IconProps = { className?: string | undefined };

const SOCIAL_ICONS: Record<(typeof FOOTER_SOCIAL)[number]["icon"], ComponentType<IconProps>> = {
  facebook: IconFacebook,
  instagram: IconInstagram,
  pinterest: IconPinterest,
};

const EXPLORE_COPY = Array.from({ length: 3 }, () => `${heroExploreLabel.toUpperCase()} •`).join(" ");

function SocialBlob({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path
        d="M10 34c4-16 16-26 32-26 18 0 28 12 28 26 0 16-12 28-28 28C20 62 6 50 10 34Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer id="site-footer" className="site-footer">
      <div className="site-footer-inner">
        <Link href={heroCtaHref} className="site-footer-badge" aria-label={heroExploreLabel}>
          <span className="site-footer-badge-ring">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <path id="footerExplorePath" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
              </defs>
              <text className="site-footer-badge-type">
                <textPath href="#footerExplorePath">{EXPLORE_COPY}</textPath>
              </text>
            </svg>
          </span>
          <IconSparkle className="site-footer-badge-star" />
        </Link>
        <p className="site-footer-statement">
          <span>{footerStatementLead}</span>
          <span>{footerStatementEnd}</span>
        </p>
        <div className="site-footer-social">
          <p className="site-footer-social-label">{footerSocialLabel}</p>
          <ul className="site-footer-social-list">
            {FOOTER_SOCIAL.map((item, index) => {
              const Icon = SOCIAL_ICONS[item.icon];
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`site-footer-social-link site-footer-social-link--${index + 1}`}
                    aria-label={item.label}
                  >
                    <SocialBlob className="site-footer-social-blob" />
                    <Icon />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p className="site-footer-mark" aria-hidden="true">
        {brandName.toUpperCase()}
      </p>
    </footer>
  );
}
