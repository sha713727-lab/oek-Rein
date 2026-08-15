import Image from "next/image";
import Link from "next/link";

import { brandDescription, brandName } from "@/constants/brand";

export function Craftsmanship() {
  return (
    <section className="home-craft">
      <div className="mx-auto max-w-[1600px] px-6 md:px-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image src="/assets/images/women.jpg" alt={`${brandName} considered skincare ritual`} fill className="object-cover" sizes="50vw" />
          </div>
          <div className="min-w-0 lg:pl-8">
            <h2 className="brand-heading mb-6 font-heading text-3xl font-medium tracking-[0.04em] normal-case md:text-4xl">
              Considered Care
            </h2>
            <p className="body-medium mb-8 max-w-xl text-pretty">{brandDescription}</p>
            <Link href="/about-us" className="luxury-button-outline" aria-label={`Discover ${brandName}`}>
              Discover {brandName}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
