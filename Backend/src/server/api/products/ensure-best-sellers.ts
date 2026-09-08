import type { RouteDefinition } from "@/server/http/load-routes";
import { requireAdmin } from "@/server/middleware/authorize";
import type { RequestContext } from "@/server/http/respond";
import { authService } from "@/server/services/auth/auth.service";
import { productService } from "@/server/services/products/product.service";

export const definition: RouteDefinition = {
  method: "POST",
  path: "/products/ensure-best-sellers",
};

export async function handler(ctx: RequestContext) {
  await requireAdmin(await authService.getUserFromSession(ctx.sessionToken));
  return productService.ensureBestSellers();
}
