import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { decodeCursor, encodeCursor } from "../src/server/database/cursor.ts";

describe("cursor pagination", () => {
  it("round-trips created_at and id", () => {
    const createdAt = new Date("2026-08-15T16:00:00.000Z");
    const encoded = encodeCursor(createdAt, "11111111-1111-4111-8111-111111111111");
    const decoded = decodeCursor(encoded);
    assert.ok(decoded);
    assert.equal(decoded.id, "11111111-1111-4111-8111-111111111111");
    assert.equal(decoded.createdAt.toISOString(), createdAt.toISOString());
  });
});
