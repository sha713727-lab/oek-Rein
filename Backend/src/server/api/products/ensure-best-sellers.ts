import type { RouteDefinition } from "@/server/http/load-routes";
import type { RequestContext } from "@/server/http/respond";
import { productService } from "@/server/services/products/product.service";

export const definition: RouteDefinition = {
  method: "POST",
  path: "/products/ensure-best-sellers",
};

export async function handler(_ctx: RequestContext) {
  return productService.ensureBestSellers();
}
