import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hmacSign, sha256Hex, timingSafeHexEqual } from "../src/lib/crypto.ts";

const secret = "a".repeat(32);

function sign(nonce: string) {
  return hmacSign({
    method: "GET",
    path: "/api/v1/health",
    timestamp: "1710000000",
    nonce,
    bodyHash: sha256Hex(""),
    secret,
  });
}

describe("hmac", () => {
  it("signs a canonical request", () => {
    const signature = sign("abc");
    assert.equal(signature.length, 64);
    assert.equal(timingSafeHexEqual(signature, sign("abc")), true);
  });

  it("changes when the nonce changes", () => {
    assert.equal(timingSafeHexEqual(sign("abc"), sign("xyz")), false);
  });

  it("rejects a mismatched signature of the same length", () => {
    const signature = sign("abc");
    const flipped = `${signature.slice(0, -1)}${signature.endsWith("a") ? "b" : "a"}`;
    assert.equal(timingSafeHexEqual(signature, flipped), false);
  });
});
