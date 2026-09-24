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
  const layoutPaths = new Set(["/", "/collections", "/best-sellers", "/craftsmanship", "/about-us", "/custom", "/disciplines"]);
  for (const path of STOREFRONT_PATHS) {
    const asLayout = layoutPaths.has(path);
    revalidateEntry(path, asLayout);
    for (const locale of LOCALES) {
      revalidateEntry(path === "/" ? `/${locale}` : `/${locale}${path}`, asLayout);
    }
  }
  if (productId) {
    revalidatePath(`/product/${productId}`);
    for (const locale of LOCALES) {
      revalidatePath(`/${locale}/product/${productId}`);
    }
  }
}
