import { BEST_SELLERS } from "@/constants/site";
import type { SerializedProduct } from "@/types/product";

export type ResolvedBestSeller = {
  key: string;
  productId: string;
  title: string;
  description: string;
  price: number;
  href: string;
  image: string;
  alt: string;
  color: string;
  wished: boolean;
};

export function resolveBestSellers(
  products: SerializedProduct[],
  wishlistIds: string[],
  colors: string[] = [],
): ResolvedBestSeller[] {
  return products.map((matched, index) => {
    const slot = BEST_SELLERS[index] ?? BEST_SELLERS[0];
    const photo = matched.images[0];
    const intro = matched.description.intro.trim();
    const fallback = slot?.tone === "mint" ? "#d5e4cf" : "#f0c5bf";
    return {
      key: matched.sku || slot?.id || matched.id,
      productId: matched.id,
      title: matched.title,
      description: intro.length > 0 ? intro : (slot?.description ?? ""),
      price: matched.effectivePrice,
      href: `/product/${matched.id}`,
      image: photo?.url ?? slot?.image ?? "",
      alt: photo?.alt || matched.title,
      color: matched.tileColor || colors[index] || fallback,
      wished: wishlistIds.includes(matched.id),
    };
  }).filter((item) => item.productId.length > 0 && item.image.length > 0);
}
