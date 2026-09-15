import Link from "next/link";

import { brandHomeLabel, brandName } from "@/constants/brand";
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
  nav: "brand-logo-type--nav",
  watermark: "brand-logo-type--watermark",
  inline: "brand-logo-type--inline",
  product: "brand-logo-type--product",
  auth: "brand-logo-type--auth",
};

export function Logo({
  theme = "dark",
  size = "nav",
  className,
  linked = true,
}: LogoProps) {
  const mark = (
    <span className={cn("brand-logo-type", SIZE_CLASS[size], theme === "light" && "is-light", className)}>
      {brandName}
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
