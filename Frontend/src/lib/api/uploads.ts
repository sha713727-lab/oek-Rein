import { apiRequest } from "@/lib/api/client";

/** Normalize browser MIME quirks (empty type / .mov) for the upload API. */
function resolveMimeType(file: File): string {
  if (file.type) {
    if (file.type === "video/x-quicktime") {
      return "video/quicktime";
    }
    return file.type;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".mov")) {
    return "video/quicktime";
  }
  if (name.endsWith(".mp4")) {
    return "video/mp4";
  }
  if (name.endsWith(".webm")) {
    return "video/webm";
  }
  if (name.endsWith(".png")) {
    return "image/png";
  }
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (name.endsWith(".webp")) {
    return "image/webp";
  }
  return "application/octet-stream";
}

export type UploadResult = {
  url: string;
  posterUrl?: string;
};

export type HeroVideoUploadResult = {
  src: string;
  mobileSrc: string;
  posterSrc: string;
};

/** Upload an image or gallery video; videos may include a poster frame. */
export async function saveUploadMedia(file: File | null): Promise<UploadResult | null> {
  if (!file || file.size < 1) {
    return null;
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return apiRequest<UploadResult>(
    "POST",
    "/admin/uploads",
    {
      mimeType: resolveMimeType(file),
      data: buffer.toString("base64"),
    },
    {},
    // Video transcode can exceed the default 8s API timeout.
    { timeoutMs: 60_000 },
  );
}

/** Upload image/video and return only the primary URL (catalog / legacy callers). */
export async function saveUpload(file: File | null): Promise<string | null> {
  const result = await saveUploadMedia(file);
  return result?.url ?? null;
}

/** Prerender transparent hero video → desktop + mobile MP4 + poster. */
export async function saveHeroVideoUpload(file: File | null): Promise<HeroVideoUploadResult | null> {
  if (!file || file.size < 1) {
    return null;
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return apiRequest<HeroVideoUploadResult>(
    "POST",
    "/admin/uploads/hero-video",
    {
      mimeType: resolveMimeType(file),
      data: buffer.toString("base64"),
    },
    {},
    // Chroma-key prerender is capped at 120s on the backend.
    { timeoutMs: 130_000 },
  );
}
