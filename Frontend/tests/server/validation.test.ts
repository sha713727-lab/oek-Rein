import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AppError } from "../../src/lib/app-error.ts";
import { parseSchema } from "../../src/lib/parse-schema.ts";
import { loginSchema } from "../../src/schemas/auth.ts";

describe("validation", () => {
  it("rejects unknown login shapes", () => {
    assert.throws(
      () => parseSchema(loginSchema, { email: "not-an-email", password: "x" }),
      (error: unknown) => error instanceof AppError && error.statusCode === 400,
    );
  });
});
