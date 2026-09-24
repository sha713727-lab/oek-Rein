import { revalidatePath } from "next/cache";

import { LOCALES } from "@/constants/site";

const STOREFRONT_PATHS = [
  "/",
  "/collections",
  "/wishlist",
  "/cart",
  "/checkout",
  "/shipping",
  "/returns",
  "/about-us",
  "/contact",
  "/best-sellers",
  "/craftsmanship",
  "/custom",
  "/disciplines",
  "/tack",
  "/admin/customer-side",
  "/admin/promos",
  "/admin/inventory",
  "/admin/orders",
  "/admin",
  "/account/orders",
] as const;

function revalidateEntry(path: string, asLayout: boolean): void {
  if (asLayout) {
    revalidatePath(path, "layout");
    return;
  }
  revalidatePath(path);
}

export function revalidateStorefront(productId?: string): void {
  const layoutPaths = new Set([
    "/",
    "/collections",
    "/best-sellers",
    "/craftsmanship",
    "/about-us",
    "/custom",
    "/disciplines",
    "/tack",
  ]);
  for (const path of STOREFRONT_PATHS) {
    const asLayout = layoutPaths.has(path);
    revalidateEntry(path, asLayout);
    // Also bust page cache explicitly (layout alone can miss some RSC payloads).
    if (asLayout) {
      revalidateEntry(path, false);
    }
    for (const locale of LOCALES) {
      const localized = path === "/" ? `/${locale}` : `/${locale}${path}`;
      revalidateEntry(localized, asLayout);
      if (asLayout) {
        revalidateEntry(localized, false);
      }
    }
  }
  if (productId) {
    revalidatePath(`/product/${productId}`);
    for (const locale of LOCALES) {
      revalidatePath(`/${locale}/product/${productId}`);
    }
  }
}
