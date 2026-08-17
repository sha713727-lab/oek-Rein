import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveBestSellers } from "../src/features/catalog/resolve-best-sellers.ts";
import type { SerializedProduct } from "../src/types/product.ts";

function product(overrides: Partial<SerializedProduct> = {}): SerializedProduct {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    _id: "11111111-1111-4111-8111-111111111111",
    title: "Vitamin C Radiance Serum",
    slug: "vitamin-c-radiance-serum",
    sku: "ZM-VITC-001",
    category: "serums",
    price: 7800,
    originalPrice: null,
    discount: 0,
    discountType: "percentage",
    description: { intro: "Brightening serum", detail: "", highlights: [] },
    specifications: { composition: "", care: "", includes: "30 ml" },
    returnPolicy: "",
    sizes: ["30 ml"],
    tileColor: null,
    colors: [],
    images: [{ url: "/vitc.png", alt: "Vitamin C", order: 0 }],
    variants: [],
    bestSeller: true,
    stock: 20,
    lowStockThreshold: 10,
    rating: 0,
    reviewCount: 0,
    status: "published",
    version: 1,
    createdAt: "2026-08-18T00:00:00.000Z",
    updatedAt: "2026-08-18T00:00:00.000Z",
    effectivePrice: 7800,
    ...overrides,
  };
}

describe("best sellers", () => {
  it("uses the product tile color ahead of the storefront slot color", () => {
    const [item] = resolveBestSellers([product({ tileColor: "#aabbcc" })], [], ["#f0c5bf"]);
    assert.equal(item?.color, "#aabbcc");
  });

  it("falls back to the storefront slot color when the product has none", () => {
    const [item] = resolveBestSellers([product({ tileColor: null })], [], ["#d5e4cf"]);
    assert.equal(item?.color, "#d5e4cf");
  });

  it("falls back to the slot image when the product has none", () => {
    const [item] = resolveBestSellers([product({ images: [] })], []);
    assert.ok(item?.image);
    assert.notEqual(item.image, "");
  });
});
