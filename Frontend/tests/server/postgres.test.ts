import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import { loadEnvConfig } from "@next/env";

import { consumeNonce } from "../../src/server/auth/nonce.ts";
import { consumeRateLimitToken } from "../../src/server/auth/rate-limit.ts";
import { closePool } from "../../src/server/database/pool.ts";
import { query } from "../../src/server/database/query.ts";

loadEnvConfig(process.cwd());

describe("postgres auth primitives", () => {
  after(async () => {
    await closePool();
  });

  it("has applied the initial migration", async () => {
    const result = await query<{ filename: string }>(
      "SELECT filename FROM schema_migration WHERE filename = $1",
      ["0001_init.sql"],
    );
    assert.equal(result.rows[0]?.filename, "0001_init.sql");
  });

  it("accepts a nonce once and rejects reuse", async () => {
    const nonce = `test-nonce-${Date.now()}-${Math.random()}`;
    assert.equal(await consumeNonce(nonce), true);
    assert.equal(await consumeNonce(nonce), false);
  });

  it("consumes a rate-limit token", async () => {
    await consumeRateLimitToken(`test-ip-${Date.now()}`);
  });
});
