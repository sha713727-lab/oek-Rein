import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import sharp from "sharp";

import { ffmpegBinary, ffprobeBinary } from "@/server/media/ffmpeg-bin";
import {
  createHeroKeyBuffers,
  type HeroKeyBox,
  type HeroKeyQuality,
  type HeroRgbaFrame,
  keyHeroFrame,
} from "@/server/media/hero-key";

const DEFAULT_START_SEC = 3.6;
const DESKTOP_WIDTH = 720;
const MOBILE_WIDTH = 480;
const CROSSFADE_FRAMES = 10;
const JOB_TIMEOUT_MS = 120_000;
const CRF = 25;

const KEY_QUALITY: Omit<HeroKeyQuality, "workWidth"> = {
  intervalMs: 0,
  fringePasses: 3,
  healPasses: 3,
  despill: true,
};

export type PrerenderHeroInput = {
  inputPath: string;
  outputDir: string;
  basename: string;
  startSec?: number;
  /** Defaults to outputDir. Poster filename: `${basename}-poster.webp`. */
  posterDir?: string;
};

export type PrerenderHeroResult = {
  src: string;
  mobileSrc: string;
  posterSrc: string;
};

type RgbaFrame = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

/** Serialize hero prerender jobs — one at a time. */
let jobTail: Promise<unknown> = Promise.resolve();

function enqueueJob<T>(fn: () => Promise<T>): Promise<T> {
  const run = jobTail.then(fn, fn);
  jobTail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function runProcess(bin: string, args: readonly string[], label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, [...args], {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > 8_000) {
        stderr = stderr.slice(-8_000);
      }
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} exited ${code}: ${stderr.trim() || "no stderr"}`));
    });
  });
}

async function probeFps(inputPath: string): Promise<number> {
  const args = [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=r_frame_rate",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    inputPath,
  ];
  const raw = await new Promise<string>((resolve, reject) => {
    const child = spawn(ffprobeBinary(), args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed: ${stderr.trim() || `exit ${code}`}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
  const match = /^(\d+)\s*\/\s*(\d+)$/.exec(raw);
  if (match) {
    const num = Number(match[1]);
    const den = Number(match[2]);
    if (den > 0 && Number.isFinite(num / den) && num / den > 0) {
      return num / den;
    }
  }
  const asFloat = Number(raw);
  if (Number.isFinite(asFloat) && asFloat > 0) {
    return asFloat;
  }
  return 30;
}

function even(n: number): number {
  const v = Math.max(2, Math.round(n));
  return v % 2 === 0 ? v : v + 1;
}

function unionBox(a: HeroKeyBox | null, b: HeroKeyBox): HeroKeyBox {
  if (!a) return b;
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

function publicUrlFor(dir: string, filename: string, kind: "video" | "poster"): string {
  const normalized = path.resolve(dir).replace(/\\/g, "/").toLowerCase();
  if (normalized.includes("/uploads")) {
    return `/uploads/${filename}`;
  }
  if (kind === "poster") {
    return `/assets/images/${filename}`;
  }
  return `/assets/videos/${filename}`;
}

async function extractPngFrames(inputPath: string, outDir: string, workWidth: number, startSec: number): Promise<string[]> {
  await mkdir(outDir, { recursive: true });
  const pattern = path.join(outDir, "frame_%05d.png");
  await runProcess(
    ffmpegBinary(),
    [
      "-y",
      "-ss",
      String(startSec),
      "-i",
      inputPath,
      "-vf",
      `scale=${workWidth}:-2`,
      "-an",
      pattern,
    ],
    "ffmpeg extract",
  );
  const names = (await readdir(outDir))
    .filter((name) => name.startsWith("frame_") && name.endsWith(".png"))
    .sort();
  return names.map((name) => path.join(outDir, name));
}

async function loadRgba(filePath: string): Promise<RgbaFrame> {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return {
    data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
    width: info.width,
    height: info.height,
  };
}

function cropToStacked(frame: RgbaFrame, box: HeroKeyBox): Buffer {
  const cropW = even(box.maxX - box.minX + 1);
  const cropH = even(box.maxY - box.minY + 1);
  const stackedH = cropH * 2;
  const out = Buffer.alloc(cropW * stackedH * 3);

  for (let y = 0; y < cropH; y += 1) {
    const srcY = box.minY + y;
    for (let x = 0; x < cropW; x += 1) {
      const srcX = box.minX + x;
      const srcI = (srcY * frame.width + srcX) * 4;
      const r = frame.data[srcI] ?? 0;
      const g = frame.data[srcI + 1] ?? 0;
      const b = frame.data[srcI + 2] ?? 0;
      const a = frame.data[srcI + 3] ?? 0;

      const topI = (y * cropW + x) * 3;
      if (a === 0) {
        out[topI] = 0;
        out[topI + 1] = 0;
        out[topI + 2] = 0;
      } else if (a === 255) {
        out[topI] = r;
        out[topI + 1] = g;
        out[topI + 2] = b;
      } else {
        const t = a / 255;
        out[topI] = Math.round(r * t);
        out[topI + 1] = Math.round(g * t);
        out[topI + 2] = Math.round(b * t);
      }

      const botI = ((cropH + y) * cropW + x) * 3;
      out[botI] = a;
      out[botI + 1] = a;
      out[botI + 2] = a;
    }
  }
  return out;
}

function blendStacked(a: Buffer, b: Buffer, t: number): Buffer {
  const out = Buffer.alloc(a.length);
  const u = 1 - t;
  for (let i = 0; i < a.length; i += 1) {
    out[i] = Math.round((a[i] ?? 0) * u + (b[i] ?? 0) * t);
  }
  return out;
}

function applyLoopCrossfade(frames: Buffer[]): Buffer[] {
  if (frames.length < CROSSFADE_FRAMES * 2 + 2) {
    return frames;
  }
  const n = CROSSFADE_FRAMES;
  const out = frames.slice();
  for (let i = 0; i < n; i += 1) {
    const t = (i + 1) / (n + 1);
    const fromEnd = frames[frames.length - n + i];
    const fromStart = frames[i];
    if (!fromEnd || !fromStart) continue;
    // Seam: early frames fade from end-of-loop into start-of-loop.
    out[i] = blendStacked(fromEnd, fromStart, t);
  }
  return out.slice(0, frames.length - n);
}

async function encodeStackedVideo(
  frames: Buffer[],
  width: number,
  height: number,
  fps: number,
  outputPath: string,
): Promise<void> {
  const rawPath = `${outputPath}.raw`;
  const stream = createWriteStream(rawPath);
  for (const frame of frames) {
    if (!stream.write(frame)) {
      await new Promise<void>((resolve) => stream.once("drain", resolve));
    }
  }
  await new Promise<void>((resolve, reject) => {
    stream.end(() => resolve());
    stream.on("error", reject);
  });

  try {
    await runProcess(
      ffmpegBinary(),
      [
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        `${width}x${height}`,
        "-r",
        String(fps),
        "-i",
        rawPath,
        "-an",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        String(CRF),
        "-preset",
        "medium",
        "-movflags",
        "+faststart",
        outputPath,
      ],
      "ffmpeg encode",
    );
  } finally {
    await rm(rawPath, { force: true });
  }
}

async function scaleStackedFrames(frames: Buffer[], srcW: number, srcH: number, dstW: number): Promise<{ frames: Buffer[]; width: number; height: number }> {
  const scale = dstW / srcW;
  const dstH = even(srcH * scale);
  const outW = even(dstW);
  const out: Buffer[] = [];
  for (const frame of frames) {
    const scaled = await sharp(frame, {
      raw: { width: srcW, height: srcH, channels: 3 },
    })
      .resize(outW, dstH, { fit: "fill" })
      .raw()
      .toBuffer();
    out.push(scaled);
  }
  return { frames: out, width: outW, height: dstH };
}

async function writePoster(firstKeyed: RgbaFrame, box: HeroKeyBox, posterPath: string): Promise<void> {
  const cropW = box.maxX - box.minX + 1;
  const cropH = box.maxY - box.minY + 1;
  const rgba = Buffer.alloc(cropW * cropH * 4);
  for (let y = 0; y < cropH; y += 1) {
    for (let x = 0; x < cropW; x += 1) {
      const srcI = ((box.minY + y) * firstKeyed.width + (box.minX + x)) * 4;
      const dstI = (y * cropW + x) * 4;
      rgba[dstI] = firstKeyed.data[srcI] ?? 0;
      rgba[dstI + 1] = firstKeyed.data[srcI + 1] ?? 0;
      rgba[dstI + 2] = firstKeyed.data[srcI + 2] ?? 0;
      rgba[dstI + 3] = firstKeyed.data[srcI + 3] ?? 0;
    }
  }
  await sharp(rgba, { raw: { width: cropW, height: cropH, channels: 4 } })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(posterPath);
}

async function prerenderOnce(input: PrerenderHeroInput): Promise<PrerenderHeroResult> {
  const startSec = input.startSec ?? DEFAULT_START_SEC;
  const posterDir = input.posterDir ?? input.outputDir;
  await mkdir(input.outputDir, { recursive: true });
  await mkdir(posterDir, { recursive: true });

  const fps = await probeFps(input.inputPath);
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "oakrein-hero-"));
  try {
    const frameDir = path.join(tempRoot, "png");
    const pngPaths = await extractPngFrames(input.inputPath, frameDir, DESKTOP_WIDTH, startSec);
    if (pngPaths.length === 0) {
      throw new Error("No frames extracted from hero source video");
    }

    const quality: HeroKeyQuality = { ...KEY_QUALITY, workWidth: DESKTOP_WIDTH };
    let buffers: ReturnType<typeof createHeroKeyBuffers> | null = null;
    let union: HeroKeyBox | null = null;
    const keyed: RgbaFrame[] = [];

    for (const pngPath of pngPaths) {
      const frame = await loadRgba(pngPath);
      const pixels = frame.width * frame.height;
      if (!buffers || buffers.pixels !== pixels) {
        buffers = createHeroKeyBuffers(pixels);
      }
      const box = keyHeroFrame(frame as HeroRgbaFrame, buffers, quality);
      if (!box) {
        continue;
      }
      union = unionBox(union, box);
      keyed.push(frame);
    }

    if (!union || keyed.length === 0) {
      throw new Error("Hero keying produced no opaque frames");
    }

    const cropW = even(union.maxX - union.minX + 1);
    const cropH = even(union.maxY - union.minY + 1);
    // Snap union max so crop matches even dimensions used for encode.
    const snapped: HeroKeyBox = {
      minX: union.minX,
      minY: union.minY,
      maxX: union.minX + cropW - 1,
      maxY: union.minY + cropH - 1,
    };
    if (snapped.maxX >= (keyed[0]?.width ?? 0)) {
      snapped.minX = Math.max(0, (keyed[0]?.width ?? cropW) - cropW);
      snapped.maxX = snapped.minX + cropW - 1;
    }
    if (snapped.maxY >= (keyed[0]?.height ?? 0)) {
      snapped.minY = Math.max(0, (keyed[0]?.height ?? cropH) - cropH);
      snapped.maxY = snapped.minY + cropH - 1;
    }

    const stacked: Buffer[] = keyed.map((frame) => cropToStacked(frame, snapped));
    const faded = applyLoopCrossfade(stacked);
    const stackedH = cropH * 2;

    const desktopName = `${input.basename}-720.mp4`;
    const mobileName = `${input.basename}-480.mp4`;
    const posterName = `${input.basename}-poster.webp`;
    const desktopPath = path.join(input.outputDir, desktopName);
    const mobilePath = path.join(input.outputDir, mobileName);
    const posterPath = path.join(posterDir, posterName);

    await encodeStackedVideo(faded, cropW, stackedH, fps, desktopPath);

    const mobile = await scaleStackedFrames(faded, cropW, stackedH, MOBILE_WIDTH);
    await encodeStackedVideo(mobile.frames, mobile.width, mobile.height, fps, mobilePath);

    const first = keyed[0];
    if (!first) {
      throw new Error("Missing first keyed frame for poster");
    }
    await writePoster(first, snapped, posterPath);

    return {
      src: publicUrlFor(input.outputDir, desktopName, "video"),
      mobileSrc: publicUrlFor(input.outputDir, mobileName, "video"),
      posterSrc: publicUrlFor(posterDir, posterName, "poster"),
    };
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

/**
 * Decode → chroma-key → stacked-alpha H.264 (720 + 480) + WebP poster.
 * One job at a time; 120s timeout.
 */
export function prerenderHeroVideo(input: PrerenderHeroInput): Promise<PrerenderHeroResult> {
  return enqueueJob(() => withTimeout(prerenderOnce(input), JOB_TIMEOUT_MS, "Hero prerender"));
}

/** Re-encode an arbitrary video upload to H.264 ≤1080p, no audio, faststart + poster. */
export async function transcodeUploadVideo(inputPath: string, outputMp4Path: string, posterPath: string): Promise<void> {
  await runProcess(
    ffmpegBinary(),
    [
      "-y",
      "-i",
      inputPath,
      "-an",
      "-vf",
      "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "23",
      "-preset",
      "medium",
      "-movflags",
      "+faststart",
      outputMp4Path,
    ],
    "ffmpeg transcode",
  );

  const tmpJpg = `${posterPath}.tmp.jpg`;
  try {
    await runProcess(
      ffmpegBinary(),
      ["-y", "-ss", "0", "-i", outputMp4Path, "-frames:v", "1", "-q:v", "2", tmpJpg],
      "ffmpeg poster",
    );
    if (posterPath.endsWith(".webp")) {
      await sharp(tmpJpg).webp({ quality: 82 }).toFile(posterPath);
    } else {
      await sharp(tmpJpg).jpeg({ quality: 85 }).toFile(posterPath);
    }
  } finally {
    await rm(tmpJpg, { force: true });
  }
}
