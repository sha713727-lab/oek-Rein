import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_STOREFRONT_CONTENT,
  DEFAULT_STOREFRONT_THEME,
  resolveStorefrontContent,
  resolveStorefrontTheme,
} from "../src/constants/storefront.ts";

describe("storefront content", () => {
  it("fills product card colors when published JSON omits them", () => {
    const content = resolveStorefrontContent({});
    assert.equal(content.productCardColors.length, 3);
    assert.equal(content.productCardColors[0], DEFAULT_STOREFRONT_CONTENT.productCardColors[0]);
    assert.ok(content.navLinks.length > 0);
    assert.ok(content.shopCategories.length > 0);
  });

  it("keeps empty nav and category arrays after admin deletes all", () => {
    const content = resolveStorefrontContent({
      navLinks: [],
      shopCategories: [],
    });
    assert.deepEqual(content.navLinks, []);
    assert.deepEqual(content.shopCategories, []);
  });

  it("keeps hidden nav links and categories in the published payload", () => {
    const content = resolveStorefrontContent({
      navLinks: [{ id: "nav-1", label: "Serums", path: "/collections/serums", hidden: true }],
      shopCategories: [
        {
          id: "creams",
          title: "Creams",
          description: "Night care",
          href: "/collections/creams",
          image: "/creams.png",
          alt: "Creams",
          icon: "flower",
          color: "#f0c5bf",
          hidden: true,
        },
      ],
    });
    assert.equal(content.navLinks[0]?.hidden, true);
    assert.equal(content.shopCategories[0]?.hidden, true);
    assert.equal(content.navLinks.filter((item) => !item.hidden).length, 0);
    assert.equal(content.shopCategories.filter((item) => !item.hidden).length, 0);
  });

  it("rejects unsafe category and nav paths", () => {
    const content = resolveStorefrontContent({
      navLinks: [{ id: "nav-1", label: "Bad", path: "https://evil.example", hidden: false }],
      shopCategories: [
        {
          id: "creams",
          title: "Creams",
          href: "//evil.example",
          description: "",
          image: "",
          alt: "",
          icon: "nope",
          color: "pink",
          hidden: false,
        },
      ],
    });
    assert.equal(content.navLinks[0]?.path.startsWith("/"), true);
    assert.equal(content.shopCategories[0]?.href.startsWith("/"), true);
    assert.equal(content.shopCategories[0]?.href.startsWith("//"), false);
    assert.equal(content.shopCategories[0]?.icon, "flower");
    assert.match(content.shopCategories[0]?.color ?? "", /^#[0-9A-Fa-f]{6}$/);
  });

  it("resolves a theme hex and falls back on invalid values", () => {
    const next = resolveStorefrontTheme({ blush: "#aabbcc", mint: "olive" });
    assert.equal(next.blush, "#aabbcc");
    assert.equal(next.mint, DEFAULT_STOREFRONT_THEME.mint);
  });
});
