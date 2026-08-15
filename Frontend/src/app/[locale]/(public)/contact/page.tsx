import Link from "next/link";

import { brandName } from "@/constants/brand";
import { ContactDetails } from "@/features/content/contact-details";

export default function ContactPage() {
  return (
    <div className="info-page">
      <div className="mx-auto max-w-[1600px] px-6 md:px-20">
        <header className="section-intro section-intro--centered">
          <span className="section-intro-eyebrow">Get in Touch</span>
          <h1 className="section-intro-title">Contact Us</h1>
          <p className="section-intro-description">
            We would love to hear from you — whether you have a question about an order, a formula, or your daily
            routine.
          </p>
        </header>
        <div className="info-page-content">
          <ContactDetails />
          <p className="info-page-note">
            Our client care team responds within one business day, Monday through Saturday.
          </p>
          <div className="info-page-actions">
            <Link href="/about-us" className="luxury-button-outline" aria-label={`About ${brandName}`}>
              About {brandName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
