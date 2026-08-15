import { cookies } from "next/headers";

import { sessionCookieName } from "@/constants/cookies";
import { authService, type AuthUser } from "@/server/services/auth/auth.service";

export async function getSessionUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(sessionCookieName)?.value;
  return authService.getUserFromSession(token);
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(sessionCookieName)?.value;
}
