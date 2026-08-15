import { randomBytes, randomInt } from "node:crypto";

import bcrypt from "bcrypt";

import { ADMIN_ROLES, type Role, ROLES } from "@/constants/roles";
import { AppError } from "@/lib/app-error";
import { sha256Hex } from "@/lib/crypto";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { accountRepository } from "@/server/database/repositories/account/account.repository";
import { sessionRepository } from "@/server/database/repositories/session/session.repository";

export type AuthUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly avatarUrl: string | null;
};

function toAuthUser(row: { id: string; name: string; email: string; role: Role; avatar_url: string | null }): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url,
  };
}

export class AuthService {
  async register(input: { name: string; email: string; password: string }): Promise<{ user: AuthUser; sessionToken: string }> {
    const email = input.email.toLowerCase().trim();
    const existing = await accountRepository.findByEmail(email);
    if (existing) {
      throw AppError.conflict("Email is already registered");
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    const account = await accountRepository.insert({
      name: input.name.trim(),
      email,
      passwordHash,
      role: ROLES.CUSTOMER,
    });
    const sessionToken = await this.createSession(account.id);
    return { user: toAuthUser(account), sessionToken };
  }

  async login(input: { email: string; password: string }): Promise<{ user: AuthUser; sessionToken: string }> {
    const account = await accountRepository.findByEmail(input.email.toLowerCase().trim());
    if (!account) {
      throw AppError.unauthenticated("Invalid email or password");
    }
    const valid = await bcrypt.compare(input.password, account.password_hash);
    if (!valid) {
      throw AppError.unauthenticated("Invalid email or password");
    }
    await accountRepository.markLogin(account.id);
    const sessionToken = await this.createSession(account.id);
    return { user: toAuthUser(account), sessionToken };
  }

  async requestAdminLogin(input: { email: string; password: string }): Promise<{
    challengeId: string;
    developmentOtp?: string | undefined;
  }> {
    const account = await accountRepository.findByEmail(input.email.toLowerCase().trim());
    if (!account) {
      throw AppError.unauthenticated("Invalid email or password");
    }
    if (!ADMIN_ROLES.includes(account.role)) {
      throw AppError.unauthorized("Admin access required");
    }
    const valid = await bcrypt.compare(input.password, account.password_hash);
    if (!valid) {
      throw AppError.unauthenticated("Invalid email or password");
    }
    const otp = String(randomInt(100000, 1000000));
    const challengeId = randomBytes(24).toString("hex");
    await accountRepository.setAdminChallenge(account.id, {
      challengeId,
      otpHash: await bcrypt.hash(otp, 10),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    logger.info({ userId: account.id }, "Admin OTP issued");
    if (getEnv().NODE_ENV === "production") {
      return { challengeId };
    }
    return { challengeId, developmentOtp: otp };
  }

  async verifyAdminOtp(input: { challengeId: string; otp: string }): Promise<{ user: AuthUser; sessionToken: string }> {
    const account = await accountRepository.findByAdminChallenge(input.challengeId);
    if (!account) {
      throw AppError.unauthenticated("Invalid verification session");
    }
    if (!account.admin_login_otp_expires || account.admin_login_otp_expires.getTime() < Date.now()) {
      throw AppError.expired("Verification code expired");
    }
    const valid = await bcrypt.compare(input.otp, account.admin_login_otp_hash ?? "");
    if (!valid) {
      throw AppError.unauthenticated("Invalid verification code");
    }
    await accountRepository.clearAdminChallenge(account.id);
    const sessionToken = await this.createSession(account.id);
    return { user: toAuthUser(account), sessionToken };
  }

  async createSession(accountId: string): Promise<string> {
    const env = getEnv();
    const token = randomBytes(32).toString("hex");
    await sessionRepository.insert({
      tokenHash: sha256Hex(token),
      accountId,
      expiresAt: new Date(Date.now() + env.SESSION_TTL_SECONDS * 1000),
    });
    return token;
  }

  async getUserFromSession(token: string | undefined): Promise<AuthUser | null> {
    if (!token) {
      return null;
    }
    const session = await sessionRepository.findValidByTokenHash(sha256Hex(token));
    if (!session) {
      return null;
    }
    const account = await accountRepository.findById(session.account_id);
    if (!account) {
      return null;
    }
    return toAuthUser(account);
  }

  async logout(token: string | undefined): Promise<void> {
    if (!token) {
      return;
    }
    await sessionRepository.deleteByTokenHash(sha256Hex(token));
  }

  async seedAdmin(): Promise<AuthUser> {
    const env = getEnv();
    const email = env.SEED_ADMIN_EMAIL.toLowerCase().trim();
    const existing = await accountRepository.findByEmail(email);
    if (existing) {
      return toAuthUser(existing);
    }
    const account = await accountRepository.insert({
      name: env.SEED_ADMIN_NAME,
      email,
      passwordHash: await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12),
      role: ROLES.SUPER_ADMIN,
    });
    return toAuthUser(account);
  }
}

export const authService = new AuthService();
