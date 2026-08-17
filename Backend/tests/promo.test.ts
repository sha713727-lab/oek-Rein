import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DISCOUNT_TYPES } from "../src/constants/catalog.ts";
import { calculatePromoDiscount } from "../src/constants/promo.ts";
import { AppError } from "../src/lib/app-error.ts";
import { parseSchema } from "../src/lib/parse-schema.ts";
import { createPromoSchema } from "../src/schemas/promo.ts";

function isValidation(error: unknown): boolean {
  return error instanceof AppError && error.statusCode === 400;
}

describe("promo discount", () => {
  it("takes a percentage of the subtotal", () => {
    assert.equal(calculatePromoDiscount(10000, DISCOUNT_TYPES.PERCENTAGE, 10), 1000);
  });

  it("caps a percentage at the subtotal", () => {
    assert.equal(calculatePromoDiscount(800, DISCOUNT_TYPES.PERCENTAGE, 100), 800);
  });

  it("applies a fixed amount without going past the subtotal", () => {
    assert.equal(calculatePromoDiscount(10000, DISCOUNT_TYPES.FIXED, 500), 500);
    assert.equal(calculatePromoDiscount(200, DISCOUNT_TYPES.FIXED, 500), 200);
  });
});

describe("promo validation", () => {
  it("uppercases a valid code", () => {
    const parsed = parseSchema(createPromoSchema, {
      code: "glow-10",
      discountType: DISCOUNT_TYPES.PERCENTAGE,
      amount: 10,
      minSubtotal: 0,
    });
    assert.equal(parsed.code, "GLOW-10");
    assert.equal(parsed.amount, 10);
  });

  it("rejects a percentage over 100", () => {
    assert.throws(
      () =>
        parseSchema(createPromoSchema, {
          code: "TOO-MUCH",
          discountType: DISCOUNT_TYPES.PERCENTAGE,
          amount: 150,
          minSubtotal: 0,
        }),
      isValidation,
    );
  });

  it("rejects an empty or unsafe code", () => {
    assert.throws(
      () =>
        parseSchema(createPromoSchema, {
          code: "x",
          discountType: DISCOUNT_TYPES.FIXED,
          amount: 500,
          minSubtotal: 0,
        }),
      isValidation,
    );
  });
});
