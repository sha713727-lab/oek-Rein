import { sessionCookieName } from "@/constants/cookies";
import { getEnv } from "@/lib/env";
import { parseSchema } from "@/lib/parse-schema";
import { adminVerifyOtpSchema } from "@/schemas/auth";
import type { RouteDefinition } from "@/server/http/load-routes";
import { type RequestContext,setCookie } from "@/server/http/respond";
import { authService } from "@/server/services/auth/auth.service";

export const definition: RouteDefinition = {
  method: "POST",
  path: "/auth/admin/verify",
};

export async function handler(ctx: RequestContext) {
  const body = parseSchema(adminVerifyOtpSchema, ctx.body);
  const result = await authService.verifyAdminOtp(body);
  setCookie(ctx.res, sessionCookieName, result.sessionToken, getEnv().SESSION_TTL_SECONDS);
  return { user: result.user };
}
