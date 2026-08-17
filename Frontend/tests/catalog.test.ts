import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getCategoryPath, normalizeCategoryFilter, toFrontendCategory } from "../src/constants/catalog.ts";

describe("catalog", () => {
  it("maps collection slugs to inventory categories", () => {
    assert.equal(normalizeCategoryFilter("new"), "new-arrivals");
    assert.equal(normalizeCategoryFilter("body"), "body-care");
    assert.equal(normalizeCategoryFilter("serums"), "serums");
    assert.equal(normalizeCategoryFilter("all"), undefined);
    assert.equal(normalizeCategoryFilter(undefined), undefined);
    assert.equal(normalizeCategoryFilter("unknown"), undefined);
  });

  it("maps inventory categories back to collection paths", () => {
    assert.equal(toFrontendCategory("new-arrivals"), "new");
    assert.equal(toFrontendCategory("body-care"), "body");
    assert.equal(getCategoryPath("serums"), "/collections/serums");
    assert.equal(getCategoryPath("new-arrivals"), "/collections/new");
  });
});
