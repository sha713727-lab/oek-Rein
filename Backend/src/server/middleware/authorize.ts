import { ADMIN_ROLES, type Role } from "@/constants/roles";
import { AppError } from "@/lib/app-error";
import type { AuthUser } from "@/server/services/auth/auth.service";

export function requireSession(user: AuthUser | null): AuthUser {
  if (!user) {
    throw AppError.unauthenticated();
  }
  return user;
}

export function requireAdmin(user: AuthUser | null): AuthUser {
  const session = requireSession(user);
  if (!ADMIN_ROLES.includes(session.role as Role)) {
    throw AppError.unauthorized();
  }
  return session;
}
