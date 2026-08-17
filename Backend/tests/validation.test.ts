import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AppError } from "../src/lib/app-error.ts";
import { parseSchema } from "../src/lib/parse-schema.ts";
import { adminVerifyPasscodeSchema, loginSchema, registerSchema } from "../src/schemas/auth.ts";
import { checkoutSchema } from "../src/schemas/order.ts";
import { createProductSchema } from "../src/schemas/product.ts";

function isValidation(error: unknown): boolean {
  return error instanceof AppError && error.statusCode === 400;
}

describe("validation", () => {
  it("rejects unknown login shapes", () => {
    assert.throws(
      () => parseSchema(loginSchema, { email: "not-an-email", password: "x" }),
      isValidation,
    );
  });

  it("rejects register when passwords do not match", () => {
    assert.throws(
      () =>
        parseSchema(registerSchema, {
          name: "Ayesha",
          email: "ayesha@example.com",
          password: "Password12",
          confirmPassword: "Password99",
        }),
      isValidation,
    );
  });

  it("rejects checkout with no line items", () => {
    assert.throws(
      () =>
        parseSchema(checkoutSchema, {
          email: "guest@example.com",
          phone: "03001234567",
          fullName: "Guest Shopper",
          address: "12 Gulberg III",
          city: "Lahore",
          postalCode: "54000",
          paymentMethod: "cod",
          items: [],
        }),
      isValidation,
    );
  });

  it("accepts a product tile color or null and rejects a bad hex", () => {
    const valid = parseSchema(createProductSchema, {
      title: "Lumie Night Cream",
      category: "creams",
      price: 6200,
      tileColor: "#d5e4cf",
    });
    assert.equal(valid.tileColor, "#d5e4cf");
    const cleared = parseSchema(createProductSchema, {
      title: "Lumie Night Cream",
      category: "creams",
      price: 6200,
      tileColor: null,
    });
    assert.equal(cleared.tileColor, null);
    assert.throws(
      () =>
        parseSchema(createProductSchema, {
          title: "Lumie Night Cream",
          category: "creams",
          price: 6200,
          tileColor: "olive",
        }),
      isValidation,
    );
  });

  it("accepts a four-digit admin passcode and rejects six digits", () => {
    const valid = parseSchema(adminVerifyPasscodeSchema, {
      challengeId: "abc123",
      otp: "4821",
    });
    assert.equal(valid.otp, "4821");
    assert.throws(
      () =>
        parseSchema(adminVerifyPasscodeSchema, {
          challengeId: "abc123",
          otp: "482156",
        }),
      isValidation,
    );
  });
});
