"use server";

import { redirect } from "next/navigation";

import { ADMIN_ROLES } from "@/constants/roles";
import { DEFAULT_STOREFRONT_CONTENT } from "@/constants/storefront";
import { storefrontPublishFromForm } from "@/features/admin/parse-storefront-form";
import { storefrontService } from "@/lib/api/storefront";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { saveUpload } from "@/lib/save-upload";
import { getSessionUser } from "@/lib/session";

async function readImage(formData: FormData, field: string): Promise<string> {
  const uploaded = await saveUpload(formData.get(`${field}File`) as File | null);
  return uploaded || String(formData.get(field) ?? "").trim();
}

async function readImageMap(formData: FormData, prefix: string, keys: string[]): Promise<Record<string, string>> {
  const entries = await Promise.all(
    keys.map(async (key) => {
      const value = await readImage(formData, `${prefix}_${key}`);
      return [key, value] as const;
    }),
  );
  return Object.fromEntries(entries.filter(([, value]) => value));
}

export async function updateCommerceSettingsAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      redirect("/admin/login");
    }
    const collectionKeys = Object.keys(DEFAULT_STOREFRONT_CONTENT.collectionImages);
    const categoryCount = Math.min(8, Math.max(0, Number(formData.get("categoryCount") ?? 0)));
    const categoryIndexes = Array.from({ length: categoryCount }, (_, index) => index);
    const [
      heroProductSrc,
      brandStoryPrimarySrc,
      brandStorySecondarySrc,
      brandStoryPortraitSrc,
      productHighlightsImage,
      glowStatsImage,
      faqImage,
      authLoginSrc,
      authRegisterSrc,
      authAdminSrc,
      categoryImages,
      collectionImages,
    ] = await Promise.all([
      readImage(formData, "heroProductSrc"),
      readImage(formData, "brandStoryPrimarySrc"),
      readImage(formData, "brandStorySecondarySrc"),
      readImage(formData, "brandStoryPortraitSrc"),
      readImage(formData, "productHighlightsImage"),
      readImage(formData, "glowStatsImage"),
      readImage(formData, "faqImage"),
      readImage(formData, "authLoginSrc"),
      readImage(formData, "authRegisterSrc"),
      readImage(formData, "authAdminSrc"),
      Promise.all(categoryIndexes.map((index) => readImage(formData, `categoryImage_${index}`))),
      readImageMap(formData, "collectionImage", collectionKeys),
    ]);
    const published = storefrontPublishFromForm(formData, {
      heroProductSrc,
      brandStoryPrimarySrc,
      brandStorySecondarySrc,
      brandStoryPortraitSrc,
      productHighlightsImage,
      glowStatsImage,
      faqImage,
      authLoginSrc,
      authRegisterSrc,
      authAdminSrc,
      categoryImages,
      collectionImages,
    });
    await storefrontService.updatePublished(published.commerce, published.theme, published.content);
    revalidateStorefront();
    redirect("/admin/customer-side");
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Storefront could not be published" };
  }
}
