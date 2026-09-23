import Image, { type ImageProps } from "next/image";

import { resolvePublicAssetSrc } from "@/lib/public-assets";

const RASTER_EXTENSIONS = /\.(png|jpe?g|webp|avif)(\?|#|$)/i;

/**
 * Only bake-time public assets go through `/_next/image`.
 * CMS `/uploads/*` live on a Docker volume and return 400 from the optimizer
 * when the runtime file isn't in the image filesystem the way Next expects.
 */
function shouldOptimize(src: string): boolean {
  if (!RASTER_EXTENSIONS.test(src)) {
    return false;
  }
  if (src.startsWith("/uploads/") || src.includes("/uploads/")) {
    return false;
  }
  return src.startsWith("/assets/");
}

/** CMS / storefront image — skips render when src is missing so Next/Image never gets "". */
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
    unoptimized: !shouldOptimize(resolved),
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
