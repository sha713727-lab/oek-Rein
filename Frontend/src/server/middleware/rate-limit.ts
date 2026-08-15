import { consumeRateLimitToken } from "@/server/auth/rate-limit";

export async function applyRateLimit(identity: string): Promise<void> {
  await consumeRateLimitToken(identity);
}
