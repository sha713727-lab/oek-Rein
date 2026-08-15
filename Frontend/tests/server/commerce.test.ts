import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculateShippingFee, calculateTaxAmount, DEFAULT_COMMERCE_SETTINGS } from "../../src/constants/commerce.ts";

describe("commerce", () => {
  it("applies free shipping at the threshold", () => {
    assert.equal(calculateShippingFee(15000, DEFAULT_COMMERCE_SETTINGS), 0);
    assert.equal(calculateShippingFee(14999, DEFAULT_COMMERCE_SETTINGS), 500);
  });

  it("calculates GST", () => {
    assert.equal(calculateTaxAmount(1000, DEFAULT_COMMERCE_SETTINGS), 170);
  });
});
