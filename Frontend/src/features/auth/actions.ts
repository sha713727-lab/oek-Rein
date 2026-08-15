"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { sessionCookieName } from "@/constants/cookies";
import { getEnv } from "@/lib/env";
import { parseSchema } from "@/lib/parse-schema";
import { loginSchema, registerSchema } from "@/schemas/auth";
import { authService } from "@/server/services/auth/auth.service";

async function setSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getEnv().SESSION_TTL_SECONDS,
  });
}

export async function registerAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const parsed = parseSchema(registerSchema, {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });
    const result = await authService.register(parsed);
    await setSession(result.sessionToken);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to register" };
  }
  redirect("/account");
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const parsed = parseSchema(loginSchema, {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    const result = await authService.login(parsed);
    await setSession(result.sessionToken);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to sign in" };
  }
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const token = store.get(sessionCookieName)?.value;
  await authService.logout(token);
  store.delete(sessionCookieName);
  revalidatePath("/");
  redirect("/");
}
