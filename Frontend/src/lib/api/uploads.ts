import { apiRequest } from "@/lib/api/client";

export async function saveUpload(file: File | null): Promise<string | null> {
  if (!file || file.size < 1) {
    return null;
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await apiRequest<{ url: string }>("POST", "/admin/uploads", {
    mimeType: file.type,
    data: buffer.toString("base64"),
  });
  return result.url;
}
