import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AppError } from "../src/lib/app-error.ts";
import { corsOrigins } from "../src/lib/env.ts";
import { loadDotEnv } from "../src/lib/load-dot-env.ts";
import { assertAllowedOrigin } from "../src/server/middleware/origin.ts";

loadDotEnv();

describe("origin", () => {
  it("allows mutating requests from a configured origin", () => {
    const origin = corsOrigins()[0];
    assert.ok(origin);
    assert.doesNotThrow(() => assertAllowedOrigin(origin, undefined, true));
  });

  it("skips origin checks for safe methods", () => {
    assert.doesNotThrow(() => assertAllowedOrigin("http://evil.example", undefined, false));
  });

  it("rejects mutating requests from an unknown origin", () => {
    assert.throws(
      () => assertAllowedOrigin("http://evil.example", undefined, true),
      (error: unknown) => error instanceof AppError && error.statusCode === 403,
    );
  });
});
