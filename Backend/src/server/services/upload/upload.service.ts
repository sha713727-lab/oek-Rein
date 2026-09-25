import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { AppError } from "@/lib/app-error";
import { getEnv } from "@/lib/env";
import { uploadDirectory } from "@/server/http/serve-upload";
import { transcodeUploadVideo } from "@/server/media/transcode-video";

const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
  ["video/x-quicktime", "mov"],
]);

const VIDEO_EXTS = new Set(["mp4", "webm", "mov"]);

export class UploadService {
  async saveImage(input: { mimeType: string; data: string }): Promise<{ url: string; posterUrl?: string }> {
    const env = getEnv();
    const ext = ALLOWED.get(input.mimeType);
    if (!ext) {
      throw AppError.validation([{ field: "mimeType", message: "Unsupported file type" }]);
    }
    let buffer: Buffer;
    try {
      buffer = Buffer.from(input.data, "base64");
    } catch {
      throw AppError.validation([{ field: "data", message: "Invalid file payload" }]);
    }
    if (buffer.length < 1) {
      throw AppError.validation([{ field: "data", message: "Empty file" }]);
    }
    if (buffer.length > env.UPLOAD_MAX_FILE_SIZE) {
      throw AppError.payloadTooLarge();
    }
    const stamp = `${Date.now()}-${randomBytes(6).toString("hex")}`;
    const name = `${stamp}.${ext}`;
    if (name.includes("..") || name.includes("/") || name.includes("\\")) {
      throw AppError.validation([{ field: "data", message: "Invalid filename" }]);
    }
    const directory = uploadDirectory();
    await mkdir(directory, { recursive: true });
    const target = path.join(directory, name);
    if (!target.startsWith(directory + path.sep) && target !== directory) {
      throw AppError.validation([{ field: "data", message: "Invalid upload path" }]);
    }
    await writeFile(target, buffer);

    if (!VIDEO_EXTS.has(ext)) {
      return { url: `/uploads/${name}` };
    }

    const outName = `${stamp}.mp4`;
    const posterName = `${stamp}-poster.webp`;
    const outPath = path.join(directory, outName);
    const posterPath = path.join(directory, posterName);
    try {
      await transcodeUploadVideo(target, outPath, posterPath);
      if (outName !== name) {
        await unlink(target).catch(() => undefined);
      }
      return { url: `/uploads/${outName}`, posterUrl: `/uploads/${posterName}` };
    } catch (error) {
      await unlink(outPath).catch(() => undefined);
      await unlink(posterPath).catch(() => undefined);
      throw AppError.unprocessable(
        error instanceof Error ? `Video transcode failed: ${error.message}` : "Video transcode failed",
      );
    }
  }
}

export const uploadService = new UploadService();
