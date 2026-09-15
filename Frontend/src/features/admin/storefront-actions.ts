"use server";

import { redirect } from "next/navigation";

import { ADMIN_ROLES } from "@/constants/roles";
import { DEFAULT_STOREFRONT_CONTENT, PRODUCT_HIGHLIGHTS_FLOAT_SLOTS } from "@/constants/storefront";
import { storefrontPublishFromForm } from "@/features/admin/parse-storefront-form";
import { storefrontService } from "@/lib/api/storefront";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { saveUpload } from "@/lib/save-upload";
import { getSessionUser } from "@/lib/session";

async function readImage(formData: FormData, field: string): Promise<string> {
  if (String(formData.get(`${field}Cleared`) ?? "") === "1") {
    return "";
  }
  const uploaded = await saveUpload(formData.get(`${field}File`) as File | null);
  if (uploaded) {
    return uploaded;
  }
  return String(formData.get(field) ?? "").trim();
}

async function readImageMap(formData: FormData, prefix: string, keys: string[]): Promise<Record<string, string>> {
  const entries = await Promise.all(
    keys.map(async (key) => {
      const value = await readImage(formData, `${prefix}_${key}`);
      return [key, value] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export async function updateCommerceSettingsAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      redirect("/admin/login");
    }
    const collectionKeys = Object.keys(DEFAULT_STOREFRONT_CONTENT.collectionImages);
    const floatKeys = PRODUCT_HIGHLIGHTS_FLOAT_SLOTS.map((slot) => slot.id);
    const categoryCount = Math.min(7, Math.max(0, Number(formData.get("categoryCount") ?? 0)));
    const categoryIndexes = Array.from({ length: categoryCount }, (_, index) => index);
    const [
      heroProductSrc,
      heroVideoSrc,
      brandStoryPrimarySrc,
      brandStorySecondarySrc,
      brandStoryPortraitSrc,
      productHighlightsImage,
      productHighlightsFloats,
      glowStatsImage,
      faqImage,
      authLoginSrc,
      authRegisterSrc,
      authAdminSrc,
      categoryImages,
      collectionImages,
    ] = await Promise.all([
      readImage(formData, "heroProductSrc"),
      readImage(formData, "heroVideoSrc"),
      readImage(formData, "brandStoryPrimarySrc"),
      readImage(formData, "brandStorySecondarySrc"),
      readImage(formData, "brandStoryPortraitSrc"),
      readImage(formData, "productHighlightsImage"),
      readImageMap(formData, "productHighlightsFloat", floatKeys),
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
      heroVideoSrc,
      brandStoryPrimarySrc,
      brandStorySecondarySrc,
      brandStoryPortraitSrc,
      productHighlightsImage,
      productHighlightsFloats,
      glowStatsImage,
      faqImage,
      authLoginSrc,
      authRegisterSrc,
      authAdminSrc,
      categoryImages,
      collectionImages,
    });
    // Force exact image paths from the form (including intentional clears) so resolve defaults
    // cannot resurrect stock FAQ / homepage art after Remove.
    published.content.heroProductSrc = heroProductSrc;
    published.content.heroVideoSrc = heroVideoSrc || DEFAULT_STOREFRONT_CONTENT.heroVideoSrc;
    published.content.brandStoryPrimarySrc = brandStoryPrimarySrc;
    published.content.brandStorySecondarySrc = brandStorySecondarySrc;
    published.content.brandStoryPortraitSrc = brandStoryPortraitSrc;
    published.content.productHighlightsImage = productHighlightsImage;
    published.content.productHighlightsFloats = {
      ...published.content.productHighlightsFloats,
      ...productHighlightsFloats,
    } as typeof published.content.productHighlightsFloats;
    published.content.glowStatsImage = glowStatsImage;
    published.content.faqImage = faqImage;
    published.content.authLoginSrc = authLoginSrc;
    published.content.authRegisterSrc = authRegisterSrc;
    published.content.authAdminSrc = authAdminSrc;
    published.content.collectionImages = {
      ...published.content.collectionImages,
      ...collectionImages,
    };
    categoryIndexes.forEach((index) => {
      const category = published.content.shopCategories[index];
      if (category) {
        category.image = categoryImages[index] ?? "";
      }
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
