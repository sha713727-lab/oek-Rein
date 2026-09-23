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
  return "application/octet-stream";
}

export async function saveUpload(file: File | null): Promise<string | null> {
  if (!file || file.size < 1) {
    return null;
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await apiRequest<{ url: string }>("POST", "/admin/uploads", {
    mimeType: resolveMimeType(file),
    data: buffer.toString("base64"),
  });
  return result.url;
}
