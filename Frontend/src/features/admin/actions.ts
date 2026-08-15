"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { sessionCookieName } from "@/constants/cookies";
import { getEnv } from "@/lib/env";
import { parseSchema } from "@/lib/parse-schema";
import { adminVerifyOtpSchema, loginSchema } from "@/schemas/auth";
import { authService } from "@/server/services/auth/auth.service";

export async function adminLoginAction(formData: FormData): Promise<{
  error?: string | undefined;
  challengeId?: string | undefined;
  developmentOtp?: string | undefined;
}> {
  try {
    const parsed = parseSchema(loginSchema, {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    return await authService.requestAdminLogin(parsed);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to start admin login" };
  }
}

export async function adminVerifyAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const parsed = parseSchema(adminVerifyOtpSchema, {
      challengeId: String(formData.get("challengeId") ?? ""),
      otp: String(formData.get("otp") ?? ""),
    });
    const result = await authService.verifyAdminOtp(parsed);
    const store = await cookies();
    store.set(sessionCookieName, result.sessionToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getEnv().SESSION_TTL_SECONDS,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invalid code" };
  }
  redirect("/admin");
}
