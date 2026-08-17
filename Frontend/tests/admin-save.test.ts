import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { productPayloadFromForm } from "../src/features/admin/parse-product-form.ts";
import { type StorefrontFormImages, storefrontPublishFromForm } from "../src/features/admin/parse-storefront-form.ts";

const IMAGES: StorefrontFormImages = {
  heroProductSrc: "/hero.png",
  brandStoryPrimarySrc: "/story-1.png",
  brandStorySecondarySrc: "/story-2.png",
  brandStoryPortraitSrc: "/portrait.png",
  productHighlightsImage: "/highlights.png",
  glowStatsImage: "/glow.png",
  faqImage: "/faq.png",
  authLoginSrc: "/login.png",
  authRegisterSrc: "/register.png",
  authAdminSrc: "/admin.png",
  categoryImages: ["/creams.png"],
  collectionImages: {},
};

describe("admin product save", () => {
  it("keeps the card backdrop from the ColorField hidden hex", () => {
    const formData = new FormData();
    formData.set("id", "11111111-1111-4111-8111-111111111111");
    formData.set("title", "Lumie Night Cream");
    formData.set("category", "creams");
    formData.set("price", "6200");
    formData.set("stock", "12");
    formData.set("status", "published");
    formData.set("sizes", "50 ml");
    formData.set("detail", "A rich night cream for overnight replenishment.");
    formData.set("tileColor", "#d5e4cf");
    const payload = productPayloadFromForm(formData, [{ url: "/lumie.png", alt: "Lumie Night Cream", order: 0 }]);
    assert.equal(payload.tileColor, "#d5e4cf");
    assert.equal(payload.category, "creams");
    assert.equal(payload.price, 6200);
  });

  it("does not send an invalid typed hex as the saved backdrop", () => {
    const formData = new FormData();
    formData.set("title", "Lumie Night Cream");
    formData.set("category", "creams");
    formData.set("price", "6200");
    formData.set("tileColor", "olive");
    const payload = productPayloadFromForm(formData, []);
    assert.equal(payload.tileColor, null);
  });
});

describe("admin storefront publish", () => {
  it("reads card backdrops, category tiles, and hidden nav from form data", () => {
    const formData = new FormData();
    formData.set("themeBg", "#f5f2ee");
    formData.set("themePrimary", "#3f3734");
    formData.set("themeSecondary", "#8a7f79");
    formData.set("themeAccent", "#c4a574");
    formData.set("themeMint", "#d5e4cf");
    formData.set("themeBlush", "#112233");
    formData.set("productCardColor1", "#aabbcc");
    formData.set("productCardColor2", "#d5e4cf");
    formData.set("productCardColor3", "#efe4ee");
    formData.set("heroStageColor", "#99aa88");
    formData.set("categoryCount", "1");
    formData.set("categoryId_0", "creams");
    formData.set("categoryTitle_0", "Night creams");
    formData.set("categoryDescription_0", "Overnight care");
    formData.set("categoryHref_0", "/collections/creams");
    formData.set("categoryIcon_0", "flower");
    formData.set("categoryColor_0", "#99aa88");
    formData.set("categoryHidden_0", "on");
    formData.set("navCount", "1");
    formData.set("navId_0", "nav-serums");
    formData.set("navLabel_0", "Serums");
    formData.set("navPath_0", "/collections/serums");
    formData.set("navHidden_0", "on");
    const published = storefrontPublishFromForm(formData, IMAGES);
    assert.equal(published.theme.blush, "#112233");
    assert.equal(published.content.productCardColors[0], "#aabbcc");
    assert.equal(published.content.heroStageColor, "#99aa88");
    assert.equal(published.content.shopCategories[0]?.title, "Night creams");
    assert.equal(published.content.shopCategories[0]?.color, "#99aa88");
    assert.equal(published.content.shopCategories[0]?.hidden, true);
    assert.equal(published.content.navLinks[0]?.label, "Serums");
    assert.equal(published.content.navLinks[0]?.hidden, true);
  });

  it("keeps a valid hidden hex when a user is still typing in the visible color field", () => {
    const formData = new FormData();
    formData.set("productCardColor1", "#aabbcc");
    formData.set("productCardColor2", "#d5e4cf");
    formData.set("productCardColor3", "#efe4ee");
    formData.set("categoryCount", "0");
    formData.set("navCount", "0");
    const published = storefrontPublishFromForm(formData, { ...IMAGES, categoryImages: [] });
    assert.equal(published.content.productCardColors[0], "#aabbcc");
    assert.deepEqual(published.content.shopCategories, []);
    assert.deepEqual(published.content.navLinks, []);
  });
});
