import { query } from "@/server/database/query";

export type IdempotencyRow = {
  key_value: string;
  request_hash: string;
  response_body: unknown;
};

export class IdempotencyRepository {
  async find(keyValue: string): Promise<IdempotencyRow | null> {
    const result = await query<IdempotencyRow>(
      `SELECT key_value, request_hash, response_body
       FROM idempotency_key
       WHERE key_value = $1 AND expires_at > NOW()
       LIMIT 1`,
      [keyValue],
    );
    return result.rows[0] ?? null;
  }

  async insert(input: {
    keyValue: string;
    requestHash: string;
    responseBody: unknown;
    expiresAt: Date;
  }): Promise<void> {
    await query(
      `INSERT INTO idempotency_key (key_value, request_hash, response_body, expires_at)
       VALUES ($1, $2, $3::jsonb, $4)
       ON CONFLICT (key_value) DO NOTHING`,
      [input.keyValue, input.requestHash, JSON.stringify(input.responseBody), input.expiresAt],
    );
  }
}

export const idempotencyRepository = new IdempotencyRepository();
