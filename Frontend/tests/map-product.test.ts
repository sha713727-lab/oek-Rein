import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toCatalogProduct } from "../src/features/catalog/map-product.ts";
import type { SerializedProduct } from "../src/types/product.ts";

function product(overrides: Partial<SerializedProduct> = {}): SerializedProduct {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    _id: "11111111-1111-4111-8111-111111111111",
    title: "Lumie Night Cream",
    slug: "lumie-night-cream",
    sku: "ZM-LUMIE-001",
    category: "creams",
    price: 6200,
    originalPrice: null,
    discount: 0,
    discountType: "percentage",
    description: { intro: "Overnight cream", detail: "A rich night cream.", highlights: [] },
    specifications: { composition: "", care: "", includes: "50 ml" },
    returnPolicy: "",
    sizes: ["50 ml"],
    tileColor: "#d5e4cf",
    colors: [],
    images: [{ url: "/lumie.png", alt: "Lumie", order: 0 }],
    variants: [],
    bestSeller: false,
    stock: 12,
    lowStockThreshold: 10,
    rating: 0,
    reviewCount: 0,
    status: "published",
    version: 1,
    createdAt: "2026-08-18T00:00:00.000Z",
    updatedAt: "2026-08-18T00:00:00.000Z",
    effectivePrice: 6200,
    ...overrides,
  };
}

describe("map product", () => {
  it("forwards the product tile color onto catalog cards", () => {
    const mapped = toCatalogProduct(product());
    assert.equal(mapped.tileColor, "#d5e4cf");
    assert.deepEqual(mapped.images, ["/lumie.png"]);
  });

  it("does not throw when tile color is missing", () => {
    const mapped = toCatalogProduct(product({ tileColor: undefined as unknown as null }));
    assert.equal(mapped.tileColor, undefined);
  });
});
