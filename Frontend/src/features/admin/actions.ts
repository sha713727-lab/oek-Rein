"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { sessionCookieName } from "@/constants/cookies";
import { authApi } from "@/lib/api/auth";
import { parseSchema } from "@/lib/parse-schema";
import { adminVerifyPasscodeSchema, loginSchema } from "@/schemas/auth";

export async function adminLoginAction(formData: FormData): Promise<{
  error?: string | undefined;
  challengeId?: string | undefined;
}> {
  try {
    const parsed = parseSchema(loginSchema, {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    return await authApi.adminLogin(parsed);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to start admin login" };
  }
}

export async function adminVerifyAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const parsed = parseSchema(adminVerifyPasscodeSchema, {
      challengeId: String(formData.get("challengeId") ?? ""),
      otp: String(formData.get("otp") ?? ""),
    });
    await authApi.adminVerify(parsed);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invalid passcode" };
  }
  const store = await cookies();
  if (!store.get(sessionCookieName)?.value) {
    return { error: "Unable to start admin session" };
  }
  redirect("/admin");
}
