import Image from "next/image";
import Link from "next/link";

import { brandName, brandShortBio, brandTagline } from "@/constants/brand";
import { INFO_STILLS } from "@/constants/site";
import { getStorefront } from "@/lib/storefront";

export default async function AboutPage() {
  const storefront = await getStorefront();
  return (
    <div className="info-page">
      <div className="mx-auto max-w-[1600px] px-6 md:px-20">
        <div className="info-page-shell">
          <figure className="ritual-still ritual-still--mint">
            <span className="ritual-still-arch" aria-hidden="true" />
            <Image
              src={INFO_STILLS.about.src}
              alt={INFO_STILLS.about.alt}
              width={304}
              height={637}
              sizes="12rem"
              className="ritual-still-image"
            />
          </figure>
          <div>
            <header className="section-intro">
              <span className="section-intro-eyebrow">The Brand</span>
              <h1 className="section-intro-title">About {brandName}</h1>
              <p className="section-intro-description">{brandTagline}</p>
            </header>
            <div className="info-page-content">
              <p>{brandShortBio}</p>
              <p>{storefront.content.aboutCopy}</p>
              <div className="info-page-actions">
                <Link href="/collections/all" className="luxury-button-outline">
                  Shop The Collection
                </Link>
                <Link href="/contact" className="luxury-button-solid">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
