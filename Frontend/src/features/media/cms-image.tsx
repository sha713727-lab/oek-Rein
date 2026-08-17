import Image, { type ImageProps } from "next/image";

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
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}) {
  const props: ImageProps = {
    src,
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
