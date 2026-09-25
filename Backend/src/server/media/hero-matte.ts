/**
 * Soft matte for a subject filmed on a plain backdrop (white studio plate, black, or any
 * flat colour).
 *
 * The backdrop is flood-filled in from the frame border, so light areas enclosed by the
 * subject (a white blaze) stay solid. Pixels reachable from the backdrop through mixed,
 * lighter-than-subject colour get fractional alpha by projecting them onto the line
 * between the plate and the nearby solid colour. Colour is emitted premultiplied, and edge
 * pixels take the colour of the solid subject next to them rather than their own mix, so
 * no backdrop colour survives in the edges (no white halo on dark backgrounds).
 */

export type Rgb = { r: number; g: number; b: number };

export type PlateEstimate = Rgb & {
  /** 90th-percentile distance of the accepted border samples from the plate. */
  spread: number;
  /** Share of border samples that matched the plate. */
  coverage: number;
};

export type MatteParams = {
  /** A border-connected pixel closer than this to the plate is backdrop. */
  plateTolerance: number;
  /** Pixels closer than this to the plate may be a mix of plate and subject (hair, edges). */
  mixTolerance: number;
  /** How far (px) a mixed edge may reach in from the backdrop. */
  softReach: number;
  /** Window radius (px) used to sample the solid colour behind an edge pixel. */
  colorRadius: number;
  /** Top fraction of rows where touching a side border counts as a clipped subject. */
  headFraction: number;
};

export type MatteBox = { minX: number; minY: number; maxX: number; maxY: number };

export type MatteStats = {
  /** Bounds of pixels with visible alpha, or null for an empty frame. */
  box: MatteBox | null;
  /** Fraction of pixels that are at least half opaque. */
  coverage: number;
  /** Subject touches the top border, or a side border within the head rows. */
  clipped: boolean;
};

export type MatteBuffers = {
  width: number;
  height: number;
  dist: Uint16Array;
  state: Uint8Array;
  depth: Uint8Array;
  queue: Int32Array;
  /** Summed-area tables of solid pixels: r, g, b, count. */
  sums: [Uint32Array, Uint32Array, Uint32Array, Uint32Array];
};

const SOLID = 0;
const BACKDROP = 1;
const MIXED = 2;
const SKIN = 3;

/** Below this plate→subject contrast the projection is unreliable; keep such edges solid. */
const MIN_CONTRAST = 40;

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function createMatteBuffers(width: number, height: number): MatteBuffers {
  const pixels = width * height;
  const tableSize = (width + 1) * (height + 1);
  return {
    width,
    height,
    dist: new Uint16Array(pixels),
    state: new Uint8Array(pixels),
    depth: new Uint8Array(pixels),
    queue: new Int32Array(pixels),
    sums: [
      new Uint32Array(tableSize),
      new Uint32Array(tableSize),
      new Uint32Array(tableSize),
      new Uint32Array(tableSize),
    ],
  };
}

/**
 * Plate colour from the top edge and the upper part of both sides (the subject usually
 * leaves through the bottom). Returns null when the border is not a plain backdrop.
 */
export function estimatePlate(rgb: Uint8Array, width: number, height: number): PlateEstimate | null {
  const step = Math.max(1, Math.round(Math.min(width, height) / 240));
  const sideRows = Math.max(1, Math.round(height * 0.7));
  const offsets: number[] = [];
  for (let x = 0; x < width; x += step) {
    offsets.push(x * 3);
  }
  for (let y = step; y < sideRows; y += step) {
    offsets.push(y * width * 3);
    offsets.push((y * width + width - 1) * 3);
  }
  if (offsets.length < 16) {
    return null;
  }

  const median = (channel: number) => {
    const values = offsets.map((offset) => rgb[offset + channel] ?? 0).sort((a, b) => a - b);
    return values[values.length >> 1] ?? 0;
  };
  const r0 = median(0);
  const g0 = median(1);
  const b0 = median(2);

  let sr = 0;
  let sg = 0;
  let sb = 0;
  const accepted: number[] = [];
  for (const offset of offsets) {
    const r = rgb[offset] ?? 0;
    const g = rgb[offset + 1] ?? 0;
    const b = rgb[offset + 2] ?? 0;
    const d = Math.hypot(r - r0, g - g0, b - b0);
    if (d <= 36) {
      sr += r;
      sg += g;
      sb += b;
      accepted.push(offset);
    }
  }
  const coverage = accepted.length / offsets.length;
  if (coverage < 0.35) {
    return null;
  }
  const r = sr / accepted.length;
  const g = sg / accepted.length;
  const b = sb / accepted.length;
  const distances = accepted
    .map((offset) => Math.hypot((rgb[offset] ?? 0) - r, (rgb[offset + 1] ?? 0) - g, (rgb[offset + 2] ?? 0) - b))
    .sort((x, y) => x - y);
  const spread = distances[Math.floor((distances.length - 1) * 0.9)] ?? 0;
  return { r, g, b, spread, coverage };
}

/** Median plate across frames — one stable backdrop colour keeps edges from flickering. */
export function combinePlates(plates: readonly PlateEstimate[]): PlateEstimate | null {
  if (plates.length === 0) {
    return null;
  }
  const pick = (key: keyof PlateEstimate) => {
    const values = plates.map((plate) => plate[key]).sort((a, b) => a - b);
    return values[values.length >> 1] ?? 0;
  };
  return { r: pick("r"), g: pick("g"), b: pick("b"), spread: pick("spread"), coverage: pick("coverage") };
}

export function defaultMatteParams(width: number, height: number, plate: PlateEstimate): MatteParams {
  const scale = Math.max(width, height) / 1080;
  return {
    plateTolerance: Math.min(42, Math.max(12, plate.spread * 2.5 + 10)),
    mixTolerance: 150,
    softReach: Math.max(2, Math.round(12 * scale)),
    colorRadius: Math.max(2, Math.round(6 * scale)),
    headFraction: 0.68,
  };
}

/**
 * Writes alpha (0–255, one byte per pixel) and, when `premulOut` is given, premultiplied
 * RGB (three bytes per pixel) for one frame.
 */
export function computeMatte(
  rgb: Uint8Array,
  plate: Rgb,
  params: MatteParams,
  buffers: MatteBuffers,
  alphaOut: Uint8Array,
  premulOut: Uint8Array | null,
): MatteStats {
  const { width: w, height: h, dist, state, depth, queue, sums } = buffers;
  const n = w * h;
  const pr = plate.r;
  const pg = plate.g;
  const pb = plate.b;

  // 1) Distance of every pixel from the plate colour.
  for (let p = 0, i = 0; p < n; p += 1, i += 3) {
    const dr = (rgb[i] ?? 0) - pr;
    const dg = (rgb[i + 1] ?? 0) - pg;
    const db = (rgb[i + 2] ?? 0) - pb;
    dist[p] = Math.sqrt(dr * dr + dg * dg + db * db);
  }
  state.fill(SOLID);

  // 2) Flood the backdrop in from the border.
  const plateTolerance = params.plateTolerance;
  let head = 0;
  let tail = 0;
  const seedBackdrop = (p: number) => {
    if (state[p] === SOLID && (dist[p] ?? 0) < plateTolerance) {
      state[p] = BACKDROP;
      queue[tail++] = p;
    }
  };
  const lastRow = n - w;
  for (let x = 0; x < w; x += 1) {
    seedBackdrop(x);
    seedBackdrop(lastRow + x);
  }
  for (let y = 1; y < h - 1; y += 1) {
    seedBackdrop(y * w);
    seedBackdrop(y * w + w - 1);
  }
  while (head < tail) {
    const p = queue[head++] ?? 0;
    const x = p % w;
    if (x > 0) seedBackdrop(p - 1);
    if (x < w - 1) seedBackdrop(p + 1);
    if (p >= w) seedBackdrop(p - w);
    if (p < lastRow) seedBackdrop(p + w);
  }

  // 3) Mixed band: walk in from the backdrop through lighter-than-subject pixels.
  const mixTolerance = params.mixTolerance;
  const reach = params.softReach;
  const isBackdrop = (q: number) => state[q] === BACKDROP;
  head = 0;
  tail = 0;
  for (let p = 0; p < n; p += 1) {
    if (state[p] !== SOLID || (dist[p] ?? 0) >= mixTolerance) continue;
    const x = p % w;
    if (
      (x > 0 && isBackdrop(p - 1)) ||
      (x < w - 1 && isBackdrop(p + 1)) ||
      (p >= w && isBackdrop(p - w)) ||
      (p < lastRow && isBackdrop(p + w))
    ) {
      state[p] = MIXED;
      depth[p] = 1;
      queue[tail++] = p;
    }
  }
  while (head < tail) {
    const p = queue[head++] ?? 0;
    const d = depth[p] ?? 0;
    if (d >= reach) continue;
    const x = p % w;
    const visit = (q: number) => {
      if (state[q] === SOLID && (dist[q] ?? 0) < mixTolerance) {
        state[q] = MIXED;
        depth[q] = d + 1;
        queue[tail++] = q;
      }
    };
    if (x > 0) visit(p - 1);
    if (x < w - 1) visit(p + 1);
    if (p >= w) visit(p - w);
    if (p < lastRow) visit(p + w);
  }

  // 3b) The outermost solid ring is still an anti-aliased step; give it computed alpha too.
  const isOpen = (q: number) => state[q] === BACKDROP || state[q] === MIXED;
  for (let p = 0; p < n; p += 1) {
    if (state[p] !== SOLID) continue;
    const x = p % w;
    if (
      (x > 0 && isOpen(p - 1)) ||
      (x < w - 1 && isOpen(p + 1)) ||
      (p >= w && isOpen(p - w)) ||
      (p < lastRow && isOpen(p + w))
    ) {
      state[p] = SKIN;
      queue[tail++] = p;
    }
  }
  const softCount = tail;

  // 4) Summed-area tables of solid colour, for the local subject colour behind each edge.
  const [sumR, sumG, sumB, sumN] = sums;
  const stride = w + 1;
  let fallbackR = 0;
  let fallbackG = 0;
  let fallbackB = 0;
  for (let y = 0; y < h; y += 1) {
    let rowR = 0;
    let rowG = 0;
    let rowB = 0;
    let rowN = 0;
    const src = y * w;
    const above = y * stride;
    const here = (y + 1) * stride;
    for (let x = 0; x < w; x += 1) {
      const p = src + x;
      if (state[p] === SOLID) {
        const i = p * 3;
        rowR += rgb[i] ?? 0;
        rowG += rgb[i + 1] ?? 0;
        rowB += rgb[i + 2] ?? 0;
        rowN += 1;
      }
      sumR[here + x + 1] = (sumR[above + x + 1] ?? 0) + rowR;
      sumG[here + x + 1] = (sumG[above + x + 1] ?? 0) + rowG;
      sumB[here + x + 1] = (sumB[above + x + 1] ?? 0) + rowB;
      sumN[here + x + 1] = (sumN[above + x + 1] ?? 0) + rowN;
    }
  }
  const totalSolid = sumN[h * stride + w] ?? 0;
  if (totalSolid > 0) {
    fallbackR = (sumR[h * stride + w] ?? 0) / totalSolid;
    fallbackG = (sumG[h * stride + w] ?? 0) / totalSolid;
    fallbackB = (sumB[h * stride + w] ?? 0) / totalSolid;
  }

  // 5) Fractional alpha for the mixed band and the skin ring.
  const radius = params.colorRadius;
  const boxSum = (table: Uint32Array, x0: number, y0: number, x1: number, y1: number) =>
    (table[(y1 + 1) * stride + x1 + 1] ?? 0) -
    (table[y0 * stride + x1 + 1] ?? 0) -
    (table[(y1 + 1) * stride + x0] ?? 0) +
    (table[y0 * stride + x0] ?? 0);
  for (let k = 0; k < softCount; k += 1) {
    const p = queue[k] ?? 0;
    const x = p % w;
    const y = (p - x) / w;
    const x0 = x > radius ? x - radius : 0;
    const y0 = y > radius ? y - radius : 0;
    const x1 = x + radius < w ? x + radius : w - 1;
    const y1 = y + radius < h ? y + radius : h - 1;
    const count = boxSum(sumN, x0, y0, x1, y1);
    let fr = fallbackR;
    let fg = fallbackG;
    let fb = fallbackB;
    if (count > 0) {
      fr = boxSum(sumR, x0, y0, x1, y1) / count;
      fg = boxSum(sumG, x0, y0, x1, y1) / count;
      fb = boxSum(sumB, x0, y0, x1, y1) / count;
    }
    const ur = fr - pr;
    const ug = fg - pg;
    const ub = fb - pb;
    const contrast = ur * ur + ug * ug + ub * ub;
    let a: number;
    if (contrast < MIN_CONTRAST * MIN_CONTRAST) {
      a = state[p] === SKIN ? 1 : clamp01((dist[p] ?? 0) / 60);
    } else {
      const i = p * 3;
      const vr = (rgb[i] ?? 0) - pr;
      const vg = (rgb[i + 1] ?? 0) - pg;
      const vb = (rgb[i + 2] ?? 0) - pb;
      a = (vr * ur + vg * ug + vb * ub) / contrast;
    }
    // Gate codec noise to clear, and let nearly solid pixels land fully opaque.
    const alpha = Math.round(clamp01((a - 0.04) / 0.93) * 255);
    alphaOut[p] = alpha;
    if (premulOut) {
      const i = p * 3;
      const coverage = alpha / 255;
      premulOut[i] = Math.round(fr * coverage);
      premulOut[i + 1] = Math.round(fg * coverage);
      premulOut[i + 2] = Math.round(fb * coverage);
    }
  }

  // 6) Alpha and premultiplied colour for backdrop / solid pixels, and frame stats.
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  let opaque = 0;
  for (let p = 0, i = 0; p < n; p += 1, i += 3) {
    const s = state[p];
    let a: number;
    if (s === BACKDROP) {
      a = 0;
      alphaOut[p] = 0;
      if (premulOut) {
        premulOut[i] = 0;
        premulOut[i + 1] = 0;
        premulOut[i + 2] = 0;
      }
    } else if (s === SOLID) {
      a = 255;
      alphaOut[p] = 255;
      if (premulOut) {
        premulOut[i] = rgb[i] ?? 0;
        premulOut[i + 1] = rgb[i + 1] ?? 0;
        premulOut[i + 2] = rgb[i + 2] ?? 0;
      }
    } else {
      a = alphaOut[p] ?? 0;
    }
    if (a > 8) {
      const x = p % w;
      const y = (p - x) / w;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (a >= 128) {
      opaque += 1;
    }
  }

  let contact = 0;
  const headRows = Math.round(h * params.headFraction);
  for (let x = 0; x < w; x += 1) {
    if ((alphaOut[x] ?? 0) >= 128) contact += 1;
  }
  for (let y = 0; y < headRows; y += 1) {
    if ((alphaOut[y * w] ?? 0) >= 128) contact += 1;
    if ((alphaOut[y * w + w - 1] ?? 0) >= 128) contact += 1;
  }

  return {
    box: maxX >= minX && maxY >= minY ? { minX, minY, maxX, maxY } : null,
    coverage: opaque / n,
    clipped: contact > Math.max(2, Math.round(h * 0.01)),
  };
}
