import { AppError } from "@/lib/app-error";
import { getEnv } from "@/lib/env";
import { rateLimitRepository } from "@/server/database/repositories/rate-limit/rate-limit.repository";

export async function consumeRateLimitToken(key: string): Promise<void> {
  const env = getEnv();
  const allowed = await rateLimitRepository.consumeToken({
    bucketKey: key,
    capacity: env.RATE_LIMIT_CAPACITY,
    refillPerSecond: env.RATE_LIMIT_REFILL_PER_SECOND,
  });
  if (!allowed) {
    throw AppError.rateLimited(Math.ceil(1 / env.RATE_LIMIT_REFILL_PER_SECOND));
  }
}
