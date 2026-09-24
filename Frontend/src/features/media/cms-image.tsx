import Image, { type ImageProps } from "next/image";

import { resolvePublicAssetSrc } from "@/lib/public-assets";

/**
 * CMS / storefront image — skips render when src is missing so Next/Image never gets "".
 *
 * Always `unoptimized`: production uploads live on a Docker volume and are served by
 * the backend at `/uploads/*`. Next's `/_next/image` optimizer cannot read those files
 * and returns 400. Static marketing assets under `/assets/` are small enough to ship as-is.
 */
export function CmsImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}) {
  const resolved = resolvePublicAssetSrc(String(src ?? "").trim());
  if (!resolved) {
    return null;
  }

  const props: ImageProps = {
    src: resolved,
    alt,
    unoptimized: true,
  };
  if (className) {
    props.className = className;
  }
  if (sizes) {
    props.sizes = sizes;
  }
  if (priority) {
    props.priority = true;
  }
  if (fill) {
    props.fill = true;
  } else {
    props.width = width ?? 304;
    props.height = height ?? 637;
  }
  return <Image {...props} alt={alt} />;
}
