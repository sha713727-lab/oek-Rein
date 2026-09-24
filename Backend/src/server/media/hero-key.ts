/**
 * Chroma key for the hero cutout (Node port of Frontend hero-key).
 * Edge-floods the white plate, erodes the pale fringe, then restores enclosed blaze holes.
 */

export type HeroKeyQuality = {
  /** Width of the buffer the key runs on; the frame is scaled down to it. */
  workWidth: number;
  /** Minimum gap between keyed frames. */
  intervalMs: number;
  fringePasses: number;
  healPasses: number;
  despill: boolean;
};

export type HeroKeyBuffers = {
  pixels: number;
  plate: Uint8Array;
  core: Uint8Array;
  pale: Uint8Array;
  lum: Uint8Array;
  opaque: Uint8Array;
  scratch: Int32Array;
};

export type HeroKeyBox = { minX: number; minY: number; maxX: number; maxY: number };

/** Minimal ImageData stand-in — Node has no DOM ImageData. */
export type HeroRgbaFrame = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

/** Breathing room around the measured silhouette so edges never clip. */
export const HERO_CROP_PAD = 6;

export function createHeroKeyBuffers(pixels: number): HeroKeyBuffers {
  return {
    pixels,
    plate: new Uint8Array(pixels),
    core: new Uint8Array(pixels),
    pale: new Uint8Array(pixels),
    lum: new Uint8Array(pixels),
    opaque: new Uint8Array(pixels),
    scratch: new Int32Array(pixels),
  };
}

/** Keys `frame` in place and returns the subject bounds, or null if empty. */
export function keyHeroFrame(
  frame: HeroRgbaFrame,
  buffers: HeroKeyBuffers,
  quality: HeroKeyQuality,
): HeroKeyBox | null {
  const w = frame.width;
  const h = frame.height;
  const pixels = w * h;
  if (pixels !== buffers.pixels) {
    return null;
  }
  const { data } = frame;
  const { plate, core, pale, lum, opaque, scratch } = buffers;

  // 1) Classify every pixel once: plate / subject core / pale fringe / luma.
  for (let p = 0, i = 0; p < pixels; p += 1, i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const max = r > g ? (r > b ? r : b) : g > b ? g : b;
    const min = r < g ? (r < b ? r : b) : g < b ? g : b;
    const sat = max === 0 ? 0 : (max - min) / max;
    const l = (r + g + b) / 3;
    lum[p] = l;
    const isPlate = (l > 210 && sat < 0.28) || (l > 155 && sat < 0.16) || (l > 125 && sat < 0.1);
    // Chestnut / bay coat, or dark muzzle, eye and leather.
    const isCore = (r > b + 8 && r > 45 && l < 185 && l > 28 && sat > 0.08) || (l < 78 && sat < 0.35);
    plate[p] = isPlate ? 1 : 0;
    core[p] = isCore ? 1 : 0;
    pale[p] = !isCore && (isPlate || l > 175) ? 1 : 0;
    opaque[p] = 1;
  }

  // 2) Flood the white plate inward from the frame edges.
  let top = 0;
  const push = (p: number) => {
    if (opaque[p] === 0 || core[p] === 1 || plate[p] === 0) return;
    opaque[p] = 0;
    scratch[top++] = p;
  };
  const lastRow = pixels - w;
  for (let x = 0; x < w; x += 1) {
    push(x);
    push(lastRow + x);
  }
  for (let y = 0; y < h; y += 1) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (top > 0) {
    const p = scratch[--top] ?? 0;
    const x = p % w;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (p >= w) push(p - w);
    if (p < lastRow) push(p + w);
  }

  // 3) Erode the pale halo welded to the silhouette.
  for (let pass = 0; pass < quality.fringePasses; pass += 1) {
    let killed = 0;
    for (let y = 0; y < h; y += 1) {
      const row = y * w;
      const edgeRow = y === 0 || y === h - 1;
      for (let x = 0; x < w; x += 1) {
        const p = row + x;
        if (opaque[p] === 0 || pale[p] === 0) continue;
        const touchesClear =
          edgeRow ||
          x === 0 ||
          x === w - 1 ||
          opaque[p - 1] === 0 ||
          opaque[p + 1] === 0 ||
          opaque[p - w] === 0 ||
          opaque[p + w] === 0 ||
          opaque[p - w - 1] === 0 ||
          opaque[p - w + 1] === 0 ||
          opaque[p + w - 1] === 0 ||
          opaque[p + w + 1] === 0;
        if (touchesClear) scratch[killed++] = p;
      }
    }
    if (killed === 0) break;
    for (let k = 0; k < killed; k += 1) opaque[scratch[k] ?? 0] = 0;
  }

  // 4) Restore blaze holes that are fully sealed by the subject.
  for (let pass = 0; pass < quality.healPasses; pass += 1) {
    let healed = 0;
    for (let y = 1; y < h - 1; y += 1) {
      const row = y * w;
      for (let x = 1; x < w - 1; x += 1) {
        const p = row + x;
        if (opaque[p] === 1 || plate[p] === 0) continue;
        const sealed =
          opaque[p - 1] === 1 &&
          opaque[p + 1] === 1 &&
          opaque[p - w] === 1 &&
          opaque[p + w] === 1 &&
          opaque[p - w - 1] === 1 &&
          opaque[p - w + 1] === 1 &&
          opaque[p + w - 1] === 1 &&
          opaque[p + w + 1] === 1;
        if (sealed) scratch[healed++] = p;
      }
    }
    if (healed === 0) break;
    for (let k = 0; k < healed; k += 1) opaque[scratch[k] ?? 0] = 1;
  }

  // 5) Write alpha, soften bright edges, and measure the crop in one pass.
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y += 1) {
    const row = y * w;
    const edgeRow = y === 0 || y === h - 1;
    for (let x = 0; x < w; x += 1) {
      const p = row + x;
      const i = p * 4;
      if (opaque[p] === 0) {
        data[i + 3] = 0;
        continue;
      }
      let alpha = 255;
      const l = lum[p] ?? 0;
      if (quality.despill && l > 150) {
        const touchesClear =
          edgeRow ||
          x === 0 ||
          x === w - 1 ||
          opaque[p - 1] === 0 ||
          opaque[p + 1] === 0 ||
          opaque[p - w] === 0 ||
          opaque[p + w] === 0 ||
          opaque[p - w - 1] === 0 ||
          opaque[p - w + 1] === 0 ||
          opaque[p + w - 1] === 0 ||
          opaque[p + w + 1] === 0;
        if (touchesClear) {
          const t = Math.min(1, (l - 150) / 80);
          const fade = 1 - t * 0.55;
          data[i] = (data[i] ?? 0) * fade;
          data[i + 1] = (data[i + 1] ?? 0) * fade;
          data[i + 2] = (data[i + 2] ?? 0) * fade;
          if (l > 200 && core[p] === 0) {
            alpha = Math.max(0, 255 - t * 220);
          }
        }
      }
      data[i + 3] = alpha;
      if (alpha > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return null;
  }
  return {
    minX: Math.max(0, minX - HERO_CROP_PAD),
    minY: Math.max(0, minY - HERO_CROP_PAD),
    maxX: Math.min(w - 1, maxX + HERO_CROP_PAD),
    maxY: Math.min(h - 1, maxY + HERO_CROP_PAD),
  };
}
