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
  await storefrontService.updatePublished(
    resolveCommerceSettings(asRecord(body.commerce)),
    resolveStorefrontTheme(body.theme),
    resolveStorefrontContent(body.content),
  );
  return storefrontService.getFull();
}
