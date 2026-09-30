import Image from "next/image";
import Link from "next/link";

import { brandHomeLabel, brandLogoMark, brandName } from "@/constants/brand";
import { cn } from "@/lib/cn";

type HeaderBrandProps = {
  theme?: "dark" | "light";
};

export function HeaderBrand({ theme = "dark" }: HeaderBrandProps) {
  return (
    <Link href="/" className="brand-logo header-brand-link" aria-label={brandHomeLabel}>
      <span className="header-brand-slot">
        <span className={cn("header-brand-crest", theme === "light" && "is-light")} aria-hidden="true">
          <Image
            src={brandLogoMark}
            alt=""
            width={88}
            height={88}
            className="brand-logo-mark-img"
            priority
            unoptimized
          />
        </span>
        <span className="header-brand-type" aria-hidden="true">
          {brandName}
        </span>
      </span>
    </Link>
  );
}
