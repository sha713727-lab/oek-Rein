"use server";

import { redirect } from "next/navigation";

import { ADMIN_ROLES } from "@/constants/roles";
import { saveUpload } from "@/lib/save-upload";
import { getSessionUser } from "@/lib/session";

/** Upload a storefront tile/media file immediately so Publish can save a stable URL. */
export async function uploadAdminMediaAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      redirect("/admin/login");
    }
    const file = formData.get("file");
    if (!(file instanceof File) || file.size < 1) {
      return { error: "Choose an image file first." };
    }
    const url = await saveUpload(file);
    if (!url) {
      return { error: "Upload failed. Try a smaller PNG, JPG, or WEBP." };
    }
    return { url };
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Upload failed" };
  }
}
