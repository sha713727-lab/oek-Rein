import { execFileSync } from "node:child_process";

import ffmpegStatic from "ffmpeg-static";
import { path as ffprobePath } from "ffprobe-static";

function whichBinary(name: string): string | undefined {
  try {
    const cmd = process.platform === "win32" ? "where" : "which";
    const out = execFileSync(cmd, [name], { encoding: "utf8" }).trim();
    const first = out.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
    return first || undefined;
  } catch {
    return undefined;
  }
}

/** Prefer apt/system ffmpeg in Docker; fall back to npm ffmpeg-static. */
export function ffmpegBinary(): string {
  const system = whichBinary("ffmpeg");
  if (system) {
    return system;
  }
  if (!ffmpegStatic) {
    throw new Error("ffmpeg binary not found (system PATH or ffmpeg-static)");
  }
  return ffmpegStatic;
}

/** Prefer system ffprobe; fall back to npm ffprobe-static. */
export function ffprobeBinary(): string {
  const system = whichBinary("ffprobe");
  if (system) {
    return system;
  }
  if (!ffprobePath) {
    throw new Error("ffprobe binary not found (system PATH or ffprobe-static)");
  }
  return ffprobePath;
}
