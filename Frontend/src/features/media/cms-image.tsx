import Image, { type ImageProps } from "next/image";

import { resolvePublicAssetSrc } from "@/lib/public-assets";

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
