import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import { resolveCommerceSettings } from "@/constants/commerce";
import { resolveStorefrontContent, resolveStorefrontTheme } from "@/constants/storefront";
import { storefrontService } from "@/lib/api/storefront";

/** Always read fresh CMS content — homepage must reflect admin Publish immediately. */
export const getStorefront = cache(async () => {
  noStore();
  const raw = await storefrontService.getFull();
  return {
    commerce: resolveCommerceSettings(raw.commerce),
    theme: resolveStorefrontTheme(raw.theme),
    content: resolveStorefrontContent(raw.content),
  };
});
