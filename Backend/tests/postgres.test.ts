import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import { DISCOUNT_TYPES, PRODUCT_STATUS } from "../src/constants/catalog.ts";
import { DEFAULT_COMMERCE_SETTINGS, resolveCommerceSettings } from "../src/constants/commerce.ts";
import {
  DEFAULT_STOREFRONT_CONTENT,
  DEFAULT_STOREFRONT_THEME,
  resolveStorefrontContent,
  resolveStorefrontTheme,
} from "../src/constants/storefront.ts";
import { AppError } from "../src/lib/app-error.ts";
import { loadDotEnv } from "../src/lib/load-dot-env.ts";
import { parseSchema } from "../src/lib/parse-schema.ts";
import { updateProductSchema } from "../src/schemas/product.ts";
import { createPromoSchema } from "../src/schemas/promo.ts";
import { consumeNonce } from "../src/server/auth/nonce.ts";
import { consumeRateLimitToken } from "../src/server/auth/rate-limit.ts";
import { closePool } from "../src/server/database/pool.ts";
import { query } from "../src/server/database/query.ts";
import { productRepository } from "../src/server/database/repositories/product/product.repository.ts";
import { storefrontRepository } from "../src/server/database/repositories/storefront/storefront.repository.ts";
import { productService } from "../src/server/services/products/product.service.ts";
import { promoService } from "../src/server/services/promo/promo.service.ts";
import { storefrontService } from "../src/server/services/storefront/storefront.service.ts";

loadDotEnv();

describe("postgres auth primitives", () => {
  after(async () => {
    await closePool();
  });

  it("has applied the initial migration", async () => {
    const result = await query<{ filename: string }>(
      "SELECT filename FROM schema_migration WHERE filename = $1",
      ["0001_init.sql"],
    );
    assert.equal(result.rows[0]?.filename, "0001_init.sql");
  });

  it("has applied the product tile color migration", async () => {
    const migrated = await query<{ filename: string }>(
      "SELECT filename FROM schema_migration WHERE filename = $1",
      ["0005_product_tile_color.sql"],
    );
    assert.equal(migrated.rows[0]?.filename, "0005_product_tile_color.sql");
    const column = await query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'product' AND column_name = 'tile_color'`,
    );
    assert.equal(column.rows[0]?.column_name, "tile_color");
  });

  it("accepts a nonce once and rejects reuse", async () => {
    const nonce = `test-nonce-${Date.now()}-${Math.random()}`;
    assert.equal(await consumeNonce(nonce), true);
    assert.equal(await consumeNonce(nonce), false);
  });

  it("consumes a rate-limit token", async () => {
    await consumeRateLimitToken(`test-ip-${Date.now()}`);
  });

  it("persists a product backdrop color through create and update", async () => {
    const stamp = `${Date.now()}`;
    const created = await productRepository.create({
      title: "Backdrop persist",
      slug: `backdrop-persist-${stamp}`,
      sku: `ZM-TILE-${stamp}`.slice(0, 40),
      category: "creams",
      price: 6200,
      originalPrice: null,
      discount: 0,
      discountType: DISCOUNT_TYPES.PERCENTAGE,
      descriptionIntro: "Test",
      descriptionDetail: "Test detail",
      descriptionHighlights: [],
      specComposition: "",
      specCare: "",
      specIncludes: "50 ml",
      returnPolicy: "Test",
      sizes: ["50 ml"],
      tileColor: "#f0c5bf",
      bestSeller: false,
      stock: 5,
      status: PRODUCT_STATUS.PUBLISHED,
      images: [],
      colors: [],
    });
    try {
      assert.equal(created.tileColor, "#f0c5bf");
      const body = parseSchema(updateProductSchema, {
        title: created.title,
        category: created.category,
        price: created.price,
        tileColor: "#d5e4cf",
        stock: created.stock,
        status: created.status,
      });
      const updated = await productService.update(created.id, { ...body });
      assert.equal(updated.tileColor, "#d5e4cf");
      const reloaded = await productService.getAdmin(created.id);
      assert.equal(reloaded.tileColor, "#d5e4cf");
      const row = await query<{ tile_color: string | null }>("SELECT tile_color FROM product WHERE id = $1", [
        created.id,
      ]);
      assert.equal(row.rows[0]?.tile_color, "#d5e4cf");
    } finally {
      await productRepository.softDeleteById(created.id);
    }
  });

  it("persists storefront category, nav, and card backdrop edits", async () => {
    const previous = await storefrontRepository.findDefault();
    const commerce = previous
      ? resolveCommerceSettings({
          currency: previous.currency,
          standardShippingFee: Number(previous.standard_shipping_fee),
          freeShippingThreshold: Number(previous.free_shipping_threshold),
          freeShippingEnabled: previous.free_shipping_enabled,
          taxEnabled: previous.tax_enabled,
          taxRate: Number(previous.tax_rate),
          taxLabel: previous.tax_label,
        })
      : DEFAULT_COMMERCE_SETTINGS;
    const theme = previous ? resolveStorefrontTheme(previous.theme) : DEFAULT_STOREFRONT_THEME;
    const content = resolveStorefrontContent({
      ...DEFAULT_STOREFRONT_CONTENT,
      productCardColors: ["#aabbcc", "#d5e4cf", "#efe4ee"],
      navLinks: [{ id: "nav-test", label: "Hidden serums", path: "/collections/serums", hidden: true }],
      shopCategories: [
        {
          id: "creams",
          title: "Creams",
          description: "Night care",
          href: "/collections/creams",
          image: "/creams.png",
          alt: "Creams",
          icon: "flower",
          color: "#d5e4cf",
          hidden: false,
        },
      ],
    });
    try {
      await storefrontService.updatePublished(commerce, theme, content);
      const saved = await storefrontService.getFull();
      assert.equal(saved.content.productCardColors[0], "#aabbcc");
      assert.equal(saved.content.shopCategories[0]?.color, "#d5e4cf");
      assert.equal(saved.content.navLinks[0]?.hidden, true);
      assert.equal(saved.content.navLinks.filter((item) => !item.hidden).length, 0);
    } finally {
      if (previous) {
        await storefrontRepository.upsertDefault(
          commerce,
          resolveStorefrontTheme(previous.theme),
          resolveStorefrontContent(previous.content),
        );
      }
    }
  });

  it("persists a promo code through create, preview, and disable", async () => {
    const code = `ZMTEST-${Date.now()}`;
    const body = parseSchema(createPromoSchema, {
      code,
      discountType: DISCOUNT_TYPES.PERCENTAGE,
      amount: 10,
      minSubtotal: 5000,
    });
    const created = await promoService.create(body);
    try {
      assert.equal(created.code, code);
      assert.equal(created.active, true);
      const preview = await promoService.preview(code, 10000);
      assert.equal(preview.discount, 1000);
      await assert.rejects(() => promoService.preview(code, 1000), (error: unknown) => {
        return error instanceof AppError && error.statusCode === 400;
      });
      const disabled = await promoService.setActive(created.id, false);
      assert.equal(disabled.active, false);
      await assert.rejects(() => promoService.preview(code, 10000), (error: unknown) => {
        return error instanceof AppError && error.statusCode === 400;
      });
      await assert.rejects(() => promoService.create(body), (error: unknown) => {
        return error instanceof AppError && error.statusCode === 409;
      });
      const fixed = parseSchema(createPromoSchema, {
        code: `${code}-F`,
        discountType: DISCOUNT_TYPES.FIXED,
        amount: 500,
        minSubtotal: 0,
      });
      const createdFixed = await promoService.create(fixed);
      try {
        const fixedPreview = await promoService.preview(fixed.code, 400);
        assert.equal(fixedPreview.discount, 400);
      } finally {
        await query("DELETE FROM promo_code WHERE id = $1", [createdFixed.id]);
      }
    } finally {
      await query("DELETE FROM promo_code WHERE id = $1", [created.id]);
    }
  });
});
