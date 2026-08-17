import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_STOREFRONT_CONTENT,
  resolveStorefrontContent,
  visibleNavLinks,
  visibleShopCategories,
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
    assert.deepEqual(visibleNavLinks(content), []);
    assert.deepEqual(visibleShopCategories(content), []);
  });

  it("hides nav links and category tiles marked hidden", () => {
    const content = resolveStorefrontContent({
      navLinks: [
        { id: "nav-1", label: "Serums", path: "/collections/serums", hidden: true },
        { id: "nav-2", label: "Creams", path: "/collections/creams", hidden: false },
      ],
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
    assert.deepEqual(
      visibleNavLinks(content).map((item) => item.id),
      ["nav-2"],
    );
    assert.deepEqual(visibleShopCategories(content), []);
  });
});
