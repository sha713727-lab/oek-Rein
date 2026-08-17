import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { asHexColor, asHexColorOrNull } from "../src/lib/hex-color.ts";

describe("hex color", () => {
  it("keeps a valid backdrop hex", () => {
    assert.equal(asHexColor("#d5e4cf"), "#d5e4cf");
    assert.equal(asHexColorOrNull("#F0C5BF"), "#F0C5BF");
  });

  it("falls back when the value is not a hex", () => {
    assert.equal(asHexColor("olive"), "#f0c5bf");
    assert.equal(asHexColorOrNull("olive"), null);
    assert.equal(asHexColorOrNull(""), null);
  });

  it("reads the saved backdrop out of form data", () => {
    const formData = new FormData();
    formData.set("tileColor", "#d5e4cf");
    formData.set("productCardColor1", "#aabbcc");
    assert.equal(asHexColorOrNull(formData.get("tileColor")), "#d5e4cf");
    assert.equal(asHexColor(formData.get("productCardColor1")), "#aabbcc");
  });
});
