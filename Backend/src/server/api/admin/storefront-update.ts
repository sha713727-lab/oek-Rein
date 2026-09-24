import { resolveCommerceSettings } from "@/constants/commerce";
import {
  MEGA_MENU_IDS,
  resolveStorefrontContent,
  resolveStorefrontTheme,
} from "@/constants/storefront";
import { AppError } from "@/lib/app-error";
import type { RouteDefinition } from "@/server/http/load-routes";
import type { RequestContext } from "@/server/http/respond";
import { requireAdmin } from "@/server/middleware/authorize";
import { authService } from "@/server/services/auth/auth.service";
import { storefrontService } from "@/server/services/storefront/storefront.service";

export const definition: RouteDefinition = {
  method: "PUT",
  path: "/admin/storefront",
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation([{ field: "body", message: "Invalid storefront payload" }]);
  }
  return value as Record<string, unknown>;
}

export async function handler(ctx: RequestContext) {
  await requireAdmin(await authService.getUserFromSession(ctx.sessionToken));
  const body = asRecord(ctx.body);
  const rawContent = asRecord(body.content);
  const content = resolveStorefrontContent(rawContent);
  // Keep intentional empty image clears from admin (do not revive stock assets).
  for (const key of [
    "heroProductSrc",
    "heroVideoSrc",
    "brandStoryPrimarySrc",
    "brandStorySecondarySrc",
    "brandStoryPortraitSrc",
    "productHighlightsImage",
    "glowStatsImage",
    "faqImage",
    "authLoginSrc",
    "authRegisterSrc",
    "authAdminSrc",
  ] as const) {
    if (Object.prototype.hasOwnProperty.call(rawContent, key)) {
      content[key] = String(rawContent[key] ?? "").trim();
    }
  }
  if (rawContent.collectionImages && typeof rawContent.collectionImages === "object") {
    const images = rawContent.collectionImages as Record<string, unknown>;
    for (const key of Object.keys(content.collectionImages)) {
      if (Object.prototype.hasOwnProperty.call(images, key)) {
        content.collectionImages[key] = String(images[key] ?? "").trim();
      }
    }
  }
  if (rawContent.productHighlightsFloats && typeof rawContent.productHighlightsFloats === "object") {
    const floats = rawContent.productHighlightsFloats as Record<string, unknown>;
    for (const key of Object.keys(content.productHighlightsFloats)) {
      if (Object.prototype.hasOwnProperty.call(floats, key)) {
        content.productHighlightsFloats[key as keyof typeof content.productHighlightsFloats] = String(
          floats[key] ?? "",
        ).trim();
      }
    }
  }
  // Preserve shop category / mega-menu tile images from the admin payload (incl. /uploads/…).
  if (Array.isArray(rawContent.shopCategories)) {
    const rawCats = rawContent.shopCategories as Record<string, unknown>[];
    const byId = new Map(
      rawCats
        .filter((item) => item && typeof item === "object")
        .map((item) => [String(item.id ?? "").trim(), item]),
    );
    content.shopCategories = content.shopCategories.map((category) => {
      const raw = byId.get(category.id);
      if (!raw || !Object.prototype.hasOwnProperty.call(raw, "image")) {
        return category;
      }
      const image = String(raw.image ?? "").trim();
      return image ? { ...category, image } : category;
    });
    content.shopImages = Object.fromEntries(content.shopCategories.map((item) => [item.id, item.image]));
  }
  if (rawContent.megaMenus && typeof rawContent.megaMenus === "object") {
    const rawMenus = rawContent.megaMenus as Record<string, unknown>;
    for (const menuId of MEGA_MENU_IDS) {
      const rawMenu = rawMenus[menuId];
      if (!rawMenu || typeof rawMenu !== "object") {
        continue;
      }
      const rawCards = Array.isArray((rawMenu as { cards?: unknown }).cards)
        ? ((rawMenu as { cards: Record<string, unknown>[] }).cards)
        : [];
      const current = content.megaMenus[menuId];
      content.megaMenus[menuId] = {
        ...current,
        cards: current.cards.map((card, index) => {
          const rawCard = rawCards[index];
          if (!rawCard || !Object.prototype.hasOwnProperty.call(rawCard, "image")) {
            return card;
          }
          const image = String(rawCard.image ?? "").trim();
          return image ? { ...card, image } : card;
        }),
      };
    }
  }
  if (rawContent.customTack && typeof rawContent.customTack === "object") {
    const rawTack = rawContent.customTack as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(rawTack, "image")) {
      const image = String(rawTack.image ?? "").trim();
      if (image) {
        content.customTack = { ...content.customTack, image };
      }
    }
  }
  await storefrontService.updatePublished(
    resolveCommerceSettings(asRecord(body.commerce)),
    resolveStorefrontTheme(body.theme),
    content,
  );
  return storefrontService.getFull();
}
