import Image from "next/image";
import Link from "next/link";

import {
  brandHomeLabel,
  brandLogoMark,
  brandLogoMarkAlt,
  brandName,
} from "@/constants/brand";
import { cn } from "@/lib/cn";

type LogoSize = "nav" | "watermark" | "inline" | "product" | "auth";

type LogoProps = {
  theme?: "dark" | "light";
  size?: LogoSize | undefined;
  className?: string | undefined;
  linked?: boolean | undefined;
  priority?: boolean | undefined;
};

const SIZE_CLASS: Record<LogoSize, string> = {
  nav: "brand-logo-mark--nav",
  watermark: "brand-logo-mark--watermark",
  inline: "brand-logo-mark--inline",
  product: "brand-logo-mark--product",
  auth: "brand-logo-mark--auth",
};

const SIZE_PX: Record<LogoSize, number> = {
  nav: 88,
  watermark: 28,
  inline: 36,
  product: 28,
  auth: 96,
};

export function Logo({
  theme = "dark",
  size = "nav",
  className,
  linked = true,
  priority = false,
}: LogoProps) {
  const px = SIZE_PX[size];
  const mark = (
    <span
      className={cn(
        "brand-logo-mark",
        SIZE_CLASS[size],
        theme === "light" && "is-light",
        className,
      )}
    >
      <Image
        src={brandLogoMark}
        alt={brandLogoMarkAlt}
        width={px}
        height={px}
        className="brand-logo-mark-img"
        priority={priority || size === "nav" || size === "auth"}
        unoptimized
      />
      <span className="sr-only">{brandName}</span>
    </span>
  );

  if (!linked) {
    return mark;
  }

  return (
    <Link href="/" className="brand-logo inline-flex max-w-full items-center" aria-label={brandHomeLabel}>
      {mark}
    </Link>
  );
}
