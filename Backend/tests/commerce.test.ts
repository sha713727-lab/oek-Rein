import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyDiscount,
  calculateOrderTotals,
  calculateShippingFee,
  calculateTaxAmount,
  DEFAULT_COMMERCE_SETTINGS,
} from "../src/constants/commerce.ts";

describe("commerce", () => {
  it("applies free shipping at the threshold", () => {
    assert.equal(calculateShippingFee(15000, DEFAULT_COMMERCE_SETTINGS), 0);
    assert.equal(calculateShippingFee(14999, DEFAULT_COMMERCE_SETTINGS), 500);
  });

  it("charges standard shipping when free shipping is off", () => {
    assert.equal(
      calculateShippingFee(20000, { ...DEFAULT_COMMERCE_SETTINGS, freeShippingEnabled: false }),
      500,
    );
  });

  it("calculates GST", () => {
    assert.equal(calculateTaxAmount(1000, DEFAULT_COMMERCE_SETTINGS), 170);
  });

  it("returns no tax when tax is disabled", () => {
    assert.equal(calculateTaxAmount(1000, { ...DEFAULT_COMMERCE_SETTINGS, taxEnabled: false }), 0);
  });

  it("clamps discounts so the subtotal cannot go negative", () => {
    assert.equal(applyDiscount(1000, 250), 750);
    assert.equal(applyDiscount(1000, 5000), 0);
    assert.equal(applyDiscount(1000, -50), 1000);
  });

  it("builds COD totals from discounted subtotal, shipping, and GST", () => {
    const totals = calculateOrderTotals(10000, DEFAULT_COMMERCE_SETTINGS, 1000);
    assert.equal(totals.subtotal, 10000);
    assert.equal(totals.discount, 1000);
    assert.equal(totals.shippingFee, 500);
    assert.equal(totals.taxAmount, 1530);
    assert.equal(totals.taxLabel, "GST");
    assert.equal(totals.total, 11030);
  });
});
