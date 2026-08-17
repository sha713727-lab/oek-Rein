import { z } from "zod";

import { parseSchema } from "@/lib/parse-schema";
import type { RouteDefinition } from "@/server/http/load-routes";
import type { RequestContext } from "@/server/http/respond";
import { requireAdmin } from "@/server/middleware/authorize";
import { authService } from "@/server/services/auth/auth.service";
import { uploadService } from "@/server/services/upload/upload.service";

export const definition: RouteDefinition = {
  method: "POST",
  path: "/admin/uploads",
};

export async function handler(ctx: RequestContext) {
  await requireAdmin(await authService.getUserFromSession(ctx.sessionToken));
  const body = parseSchema(
    z.object({
      mimeType: z.string().min(1),
      data: z.string().min(1),
    }),
    ctx.body,
  );
  return uploadService.saveImage(body);
}
