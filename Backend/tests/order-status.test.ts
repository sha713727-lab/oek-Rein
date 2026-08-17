import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ORDER_STATUS, ORDER_STATUS_TRANSITIONS } from "../src/constants/order-status.ts";

describe("order status", () => {
  it("allows pending to move into processing or cancelled", () => {
    assert.deepEqual(ORDER_STATUS_TRANSITIONS.pending, [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED]);
  });

  it("allows processing to move into shipped or cancelled", () => {
    assert.deepEqual(ORDER_STATUS_TRANSITIONS.processing, [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED]);
  });

  it("allows shipped to move into delivered or cancelled", () => {
    assert.deepEqual(ORDER_STATUS_TRANSITIONS.shipped, [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED]);
  });

  it("locks delivered and cancelled orders", () => {
    assert.deepEqual(ORDER_STATUS_TRANSITIONS.delivered, []);
    assert.deepEqual(ORDER_STATUS_TRANSITIONS.cancelled, []);
  });
});
