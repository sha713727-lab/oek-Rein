import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { AppError } from "@/lib/app-error";
import { getEnv } from "@/lib/env";

const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export class UploadService {
  async saveImage(input: { mimeType: string; data: string }): Promise<{ url: string }> {
    const env = getEnv();
    const ext = ALLOWED.get(input.mimeType);
    if (!ext) {
      throw AppError.validation([{ field: "mimeType", message: "Unsupported image type" }]);
    }
    let buffer: Buffer;
    try {
      buffer = Buffer.from(input.data, "base64");
    } catch {
      throw AppError.validation([{ field: "data", message: "Invalid image payload" }]);
    }
    if (buffer.length < 1) {
      throw AppError.validation([{ field: "data", message: "Empty image" }]);
    }
    if (buffer.length > env.UPLOAD_MAX_FILE_SIZE) {
      throw AppError.payloadTooLarge();
    }
    const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
    if (name.includes("..") || name.includes("/") || name.includes("\\")) {
      throw AppError.validation([{ field: "data", message: "Invalid filename" }]);
    }
    const directory = path.resolve(process.cwd(), env.UPLOAD_DIR);
    await mkdir(directory, { recursive: true });
    const target = path.join(directory, name);
    if (!target.startsWith(directory)) {
      throw AppError.validation([{ field: "data", message: "Invalid upload path" }]);
    }
    await writeFile(target, buffer);
    return { url: `/uploads/${name}` };
  }
}

export const uploadService = new UploadService();
