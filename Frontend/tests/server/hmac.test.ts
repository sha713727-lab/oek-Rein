import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hmacSign, sha256Hex, timingSafeHexEqual } from "../../src/lib/crypto.ts";

describe("hmac", () => {
  it("signs a canonical request", () => {
    const signature = hmacSign({
      method: "GET",
      path: "/api/v1/health",
      timestamp: "1710000000",
      nonce: "abc",
      bodyHash: sha256Hex(""),
      secret: "a".repeat(32),
    });
    assert.equal(signature.length, 64);
    assert.equal(
      timingSafeHexEqual(signature, hmacSign({
        method: "GET",
        path: "/api/v1/health",
        timestamp: "1710000000",
        nonce: "abc",
        bodyHash: sha256Hex(""),
        secret: "a".repeat(32),
      })),
      true,
    );
  });
});
