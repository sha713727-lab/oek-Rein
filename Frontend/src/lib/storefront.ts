import { cache } from "react";

import { resolveCommerceSettings } from "@/constants/commerce";
import { resolveStorefrontContent, resolveStorefrontTheme } from "@/constants/storefront";
import { storefrontService } from "@/lib/api/storefront";

export const getStorefront = cache(async () => {
  const raw = await storefrontService.getFull();
  return {
    commerce: resolveCommerceSettings(raw.commerce),
    theme: resolveStorefrontTheme(raw.theme),
    content: resolveStorefrontContent(raw.content),
  };
});
