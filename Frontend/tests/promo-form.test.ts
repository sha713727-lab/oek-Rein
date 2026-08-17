import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DISCOUNT_TYPES } from "../src/constants/catalog.ts";
import { promoPayloadFromForm } from "../src/features/admin/parse-promo-form.ts";

describe("admin promo form", () => {
  it("reads a percentage code from form data", () => {
    const formData = new FormData();
    formData.set("code", " glow10 ");
    formData.set("discountType", DISCOUNT_TYPES.PERCENTAGE);
    formData.set("amount", "10");
    formData.set("minSubtotal", "15000");
    const payload = promoPayloadFromForm(formData);
    assert.ok(!("error" in payload));
    assert.equal(payload.code, "GLOW10");
    assert.equal(payload.discountType, DISCOUNT_TYPES.PERCENTAGE);
    assert.equal(payload.amount, 10);
    assert.equal(payload.minSubtotal, 15000);
  });

  it("rejects a percentage over 100", () => {
    const formData = new FormData();
    formData.set("code", "HUGE");
    formData.set("discountType", DISCOUNT_TYPES.PERCENTAGE);
    formData.set("amount", "150");
    formData.set("minSubtotal", "0");
    const payload = promoPayloadFromForm(formData);
    assert.ok("error" in payload);
    assert.match(payload.error, /100/);
  });

  it("rejects a one-character code", () => {
    const formData = new FormData();
    formData.set("code", "A");
    formData.set("discountType", DISCOUNT_TYPES.FIXED);
    formData.set("amount", "500");
    const payload = promoPayloadFromForm(formData);
    assert.ok("error" in payload);
  });

  it("reads a fixed amount in rupees", () => {
    const formData = new FormData();
    formData.set("code", "save500");
    formData.set("discountType", DISCOUNT_TYPES.FIXED);
    formData.set("amount", "500");
    formData.set("minSubtotal", "0");
    const payload = promoPayloadFromForm(formData);
    assert.ok(!("error" in payload));
    assert.equal(payload.code, "SAVE500");
    assert.equal(payload.discountType, DISCOUNT_TYPES.FIXED);
    assert.equal(payload.amount, 500);
  });

  it("rejects a negative minimum", () => {
    const formData = new FormData();
    formData.set("code", "GLOW10");
    formData.set("discountType", DISCOUNT_TYPES.PERCENTAGE);
    formData.set("amount", "10");
    formData.set("minSubtotal", "-1");
    const payload = promoPayloadFromForm(formData);
    assert.ok("error" in payload);
    assert.match(payload.error, /negative/i);
  });
});
