import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import bcrypt from "bcrypt";

import { loadDotEnv } from "../src/lib/load-dot-env.ts";
import { getEnv } from "../src/lib/env.ts";
import { closePool } from "../src/server/database/pool.ts";
import { accountRepository } from "../src/server/database/repositories/account/account.repository.ts";
import { authService } from "../src/server/services/auth/auth.service.ts";

loadDotEnv();

after(async () => {
  await closePool();
});

describe("seed admin", () => {
  it("syncs the seeded admin password from environment", async () => {
    const env = getEnv();
    const user = await authService.seedAdmin();
    assert.equal(user.email, env.SEED_ADMIN_EMAIL.toLowerCase().trim());
    const row = await accountRepository.findByEmail(user.email);
    assert.ok(row);
    const valid = await bcrypt.compare(env.SEED_ADMIN_PASSWORD, row.password_hash);
    assert.equal(valid, true);
    const challenge = await authService.requestAdminLogin({
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
    });
    assert.ok(challenge.challengeId);
  });
});
