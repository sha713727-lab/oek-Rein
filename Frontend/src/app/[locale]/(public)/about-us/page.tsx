import Link from "next/link";

import { brandName, brandShortBio, brandTagline } from "@/constants/brand";

export default function AboutPage() {
  return (
    <div className="info-page">
      <div className="mx-auto max-w-[1600px] px-6 md:px-20">
        <header className="section-intro section-intro--centered">
          <span className="section-intro-eyebrow">The Brand</span>
          <h1 className="section-intro-title">About {brandName}</h1>
          <p className="section-intro-description">{brandTagline}</p>
        </header>
        <div className="info-page-content">
          <p>{brandShortBio}</p>
          <p>
            From serums and creams to cleansers and body treatments, {brandName} is designed for people who want
            considered products, honest language, and a routine that stays simple.
          </p>
          <div className="info-page-actions">
            <Link href="/collections/all" className="luxury-button-outline">
              Shop The Ritual
            </Link>
            <Link href="/contact" className="luxury-button-solid">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
