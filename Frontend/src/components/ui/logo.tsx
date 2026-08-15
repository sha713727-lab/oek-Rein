import Image from "next/image";
import Link from "next/link";

import {
  brandHomeLabel,
  brandLogoCaps,
  brandLogoCapsOnLight,
  brandLogoWordmark,
  brandLogoWordmarkOnLight,
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
  nav: "h-5 w-auto max-h-5 max-w-[8rem] object-contain object-left md:h-[1.4rem] md:max-h-[1.4rem] md:max-w-[9rem]",
  watermark: "h-[0.62rem] w-auto max-h-[0.62rem] max-w-[5.25rem] object-contain object-left",
  inline: "h-[1.05rem] w-auto max-h-[1.15rem] max-w-[7rem] object-contain object-left align-middle",
  product: "h-[0.72rem] w-auto max-h-[0.72rem] max-w-[6rem] object-contain object-left opacity-80",
  auth: "h-7 w-auto max-h-7 max-w-[10rem] object-contain object-left",
};

export function Logo({
  theme = "dark",
  size = "nav",
  className,
  linked = true,
  priority = false,
}: LogoProps) {
  const onDarkBackground = theme === "light";
  const useCaps = size === "watermark";
  const src = useCaps
    ? onDarkBackground
      ? brandLogoCaps
      : brandLogoCapsOnLight
    : onDarkBackground
      ? brandLogoWordmark
      : brandLogoWordmarkOnLight;
  const image = (
    <Image
      src={src}
      alt={brandName}
      width={useCaps ? 1024 : 974}
      height={useCaps ? 341 : 181}
      className={cn("brand-logo-img", SIZE_CLASS[size], className)}
      priority={priority}
    />
  );

  if (!linked) {
    return image;
  }

  return (
    <Link href="/" className="brand-logo inline-flex max-w-full items-center" aria-label={brandHomeLabel}>
      {image}
    </Link>
  );
}
