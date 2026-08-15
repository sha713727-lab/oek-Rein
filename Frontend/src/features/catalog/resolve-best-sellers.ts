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
  tone: "blush" | "mint";
  wished: boolean;
};

export function resolveBestSellers(products: SerializedProduct[], wishlistIds: string[]): ResolvedBestSeller[] {
  return BEST_SELLERS.map((slot, index) => {
    const matched = products[index];
    if (!matched) {
      return {
        key: slot.id,
        productId: "",
        title: slot.title,
        description: slot.description,
        price: slot.price,
        href: slot.href,
        image: slot.image,
        alt: slot.alt,
        tone: slot.tone,
        wished: false,
      };
    }
    const intro = matched.description.intro.trim();
    return {
      key: slot.id,
      productId: matched.id,
      title: matched.title,
      description: intro.length > 0 ? intro : slot.description,
      price: matched.effectivePrice,
      href: `/product/${matched.id}`,
      image: slot.image,
      alt: slot.alt,
      tone: slot.tone,
      wished: wishlistIds.includes(matched.id),
    };
  }).filter((item) => item.productId.length > 0);
}
