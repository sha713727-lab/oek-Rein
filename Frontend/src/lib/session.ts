import { cache } from "react";

import { authApi, type AuthUser } from "@/lib/api/auth";
import { AppError } from "@/lib/app-error";

export type { AuthUser };

export const getSessionUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const result = await authApi.me();
    return result.user;
  } catch (error) {
    if (error instanceof AppError && (error.statusCode === 401 || error.statusCode === 403)) {
      return null;
    }
    throw error;
  }
});
