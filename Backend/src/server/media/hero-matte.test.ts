import assert from "node:assert/strict";
import { test } from "node:test";

import {
  computeMatte,
  createMatteBuffers,
  defaultMatteParams,
  estimatePlate,
  type Rgb,
} from "@/server/media/hero-matte";

const WIDTH = 120;
const HEIGHT = 160;
const PLATE: Rgb = { r: 244, g: 244, b: 242 };
const COAT: Rgb = { r: 118, g: 58, b: 30 };
const BLAZE: Rgb = { r: 250, g: 250, b: 248 };

type Paint = (x: number, y: number) => { color: Rgb; cover: number } | null;

/** A frame on a slightly noisy studio plate, painted with `paint` (cover = subject share). */
function frame(paint: Paint): Uint8Array {
  const rgb = new Uint8Array(WIDTH * HEIGHT * 3);
  let seed = 7;
  const noise = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed % 5) - 2;
  };
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const i = (y * WIDTH + x) * 3;
      const hit = paint(x, y);
      const cover = hit?.cover ?? 0;
      const color = hit?.color ?? PLATE;
      rgb[i] = Math.round(color.r * cover + PLATE.r * (1 - cover)) + noise();
      rgb[i + 1] = Math.round(color.g * cover + PLATE.g * (1 - cover)) + noise();
      rgb[i + 2] = Math.round(color.b * cover + PLATE.b * (1 - cover)) + noise();
    }
  }
  return rgb;
}

/** Horse-head stand-in: an ellipse joined to a neck that leaves through the bottom edge, with an enclosed blaze. */
function headPaint(centerX: number): Paint {
  return (x, y) => {
    const inBlaze = Math.abs(x - centerX) <= 4 && y >= 45 && y <= 95;
    if (inBlaze) return { color: BLAZE, cover: 1 };
    const dx = (x - centerX) / 34;
    const dy = (y - 70) / 48;
    const radial = Math.sqrt(dx * dx + dy * dy);
    const inNeck = y >= 70 && Math.abs(x - centerX) <= 26;
    if (inNeck || radial <= 0.95) return { color: COAT, cover: 1 };
    // Anti-aliased rim: coverage ramps down over about two pixels.
    if (radial < 1) return { color: COAT, cover: (1 - radial) / 0.05 };
    return null;
  };
}

function matte(rgb: Uint8Array) {
  const plate = estimatePlate(rgb, WIDTH, HEIGHT);
  assert.ok(plate, "plain backdrop should be detected");
  const alpha = new Uint8Array(WIDTH * HEIGHT);
  const premul = new Uint8Array(WIDTH * HEIGHT * 3);
  const stats = computeMatte(
    rgb,
    plate,
    defaultMatteParams(WIDTH, HEIGHT, plate),
    createMatteBuffers(WIDTH, HEIGHT),
    alpha,
    premul,
  );
  return { plate, alpha, premul, stats };
}

test("estimatePlate finds the studio backdrop colour", () => {
  const { plate } = matte(frame(headPaint(60)));
  assert.ok(Math.abs(plate.r - PLATE.r) < 3 && Math.abs(plate.g - PLATE.g) < 3 && Math.abs(plate.b - PLATE.b) < 3);
  assert.ok(plate.coverage > 0.9);
});

test("estimatePlate rejects a busy border", () => {
  const rgb = new Uint8Array(WIDTH * HEIGHT * 3);
  for (let i = 0; i < rgb.length; i += 1) rgb[i] = (i * 97) % 256;
  assert.equal(estimatePlate(rgb, WIDTH, HEIGHT), null);
});

test("computeMatte keeps an enclosed white blaze solid and clears the backdrop", () => {
  const { alpha, stats } = matte(frame(headPaint(60)));
  const at = (x: number, y: number) => alpha[y * WIDTH + x] ?? -1;
  assert.equal(at(60, 70), 255, "blaze centre");
  assert.equal(at(60, 50), 255, "blaze top");
  assert.equal(at(40, 110), 255, "neck");
  assert.equal(at(2, 2), 0, "top-left backdrop");
  assert.equal(at(WIDTH - 3, 30), 0, "right backdrop");
  assert.equal(stats.clipped, false);
  assert.ok(stats.box && stats.box.minY >= 20 && stats.box.minY <= 24, "box starts at the head top");
  assert.equal(stats.box?.maxY, HEIGHT - 1, "neck reaches the bottom edge");
});

test("computeMatte gives rim pixels partial alpha with subject colour only", () => {
  const { alpha, premul } = matte(frame(headPaint(60)));
  let rims = 0;
  let worstExcess = 0;
  for (let p = 0; p < WIDTH * HEIGHT; p += 1) {
    const a = alpha[p] ?? 0;
    if (a === 0 || a === 255) continue;
    rims += 1;
    const coverage = a / 255;
    worstExcess = Math.max(
      worstExcess,
      (premul[p * 3] ?? 0) - COAT.r * coverage,
      (premul[p * 3 + 1] ?? 0) - COAT.g * coverage,
      (premul[p * 3 + 2] ?? 0) - COAT.b * coverage,
    );
  }
  assert.ok(rims > 20, "the anti-aliased rim is soft, not binary");
  // Keeping the plate in the rim would add about (1 - alpha) × 212 to blue: a white halo.
  assert.ok(worstExcess < 16, `rim colour carries plate (worst excess ${worstExcess.toFixed(1)})`);
});

test("computeMatte flags a subject cut off by a side of the frame", () => {
  const { stats } = matte(frame(headPaint(8)));
  assert.equal(stats.clipped, true);
});
