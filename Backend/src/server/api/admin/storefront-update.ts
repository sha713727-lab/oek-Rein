import { resolveCommerceSettings } from "@/constants/commerce";
import { resolveStorefrontContent, resolveStorefrontTheme } from "@/constants/storefront";
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
  await storefrontService.updatePublished(
    resolveCommerceSettings(asRecord(body.commerce)),
    resolveStorefrontTheme(body.theme),
    content,
  );
  return storefrontService.getFull();
}
