import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import { getEnv } from "@/lib/env";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

/** Absolute directory where admin uploads are stored. */
export function uploadDirectory(): string {
  const env = getEnv();
  return path.resolve(process.cwd(), env.UPLOAD_DIR);
}

/**
 * Serves GET /uploads/<file> from UPLOAD_DIR.
 * Returns true when the request was handled (including 404/405).
 */
export async function tryServeUpload(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<boolean> {
  if (!pathname.startsWith("/uploads/")) {
    return false;
  }

  if ((req.method ?? "GET") !== "GET" && (req.method ?? "GET") !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return true;
  }

  const rawName = decodeURIComponent(pathname.slice("/uploads/".length));
  const name = path.basename(rawName);
  if (!name || name !== rawName.replace(/\\/g, "/") || name.includes("..")) {
    res.writeHead(400);
    res.end("Bad request");
    return true;
  }

  const directory = uploadDirectory();
  const target = path.join(directory, name);
  if (!target.startsWith(directory + path.sep) && target !== directory) {
    res.writeHead(400);
    res.end("Bad request");
    return true;
  }

  try {
    await access(target);
    const info = await stat(target);
    if (!info.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return true;
    }
  } catch {
    res.writeHead(404);
    res.end("Not found");
    return true;
  }

  const ext = path.extname(name).toLowerCase();
  const type = MIME[ext] ?? "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "public, max-age=604800, immutable",
  });
  if ((req.method ?? "GET") === "HEAD") {
    res.end();
    return true;
  }
  await pipeline(createReadStream(target), res);
  return true;
}
