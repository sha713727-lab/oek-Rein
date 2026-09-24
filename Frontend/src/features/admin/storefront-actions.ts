"use server";

import { redirect } from "next/navigation";

import { ADMIN_ROLES } from "@/constants/roles";
import {
  DEFAULT_STOREFRONT_CONTENT,
  MEGA_MENU_IDS,
  type MegaMenuId,
  PRODUCT_HIGHLIGHTS_FLOAT_SLOTS,
} from "@/constants/storefront";
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
    const riderCount = DEFAULT_STOREFRONT_CONTENT.riderGallery.items.length;
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
      customTackImage,
      riderGalleryImages,
      ...megaCardImageLists
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
      readImage(formData, "customTackImage"),
      Promise.all(
        Array.from({ length: riderCount }, (_, index) => readImage(formData, `riderGalleryItemSrc_${index}`)),
      ),
      ...MEGA_MENU_IDS.map((menuId) =>
        Promise.all(
          DEFAULT_STOREFRONT_CONTENT.megaMenus[menuId].cards.map((_, index) =>
            readImage(formData, `megaCardImage_${menuId}_${index}`),
          ),
        ),
      ),
    ]);

    const megaCardImages = Object.fromEntries(
      MEGA_MENU_IDS.map((menuId, index) => [menuId, megaCardImageLists[index] ?? []]),
    ) as Record<MegaMenuId, string[]>;

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
      customTackImage,
      megaCardImages,
      riderGalleryImages,
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
    published.content.customTack = {
      ...published.content.customTack,
      image: customTackImage || DEFAULT_STOREFRONT_CONTENT.customTack.image,
    };
    published.content.riderGallery = {
      ...published.content.riderGallery,
      items: published.content.riderGallery.items.map((item, index) => ({
        ...item,
        src:
          riderGalleryImages[index] ||
          item.src ||
          DEFAULT_STOREFRONT_CONTENT.riderGallery.items[index]?.src ||
          "",
      })),
    };
    categoryIndexes.forEach((index) => {
      const id = String(formData.get(`categoryId_${index}`) ?? "").trim();
      const category =
        published.content.shopCategories.find((item) => item.id === id) ??
        published.content.shopCategories[index];
      if (!category) {
        return;
      }
      const hiddenRaw = String(formData.get(`categoryHidden_${index}`) ?? "")
        .trim()
        .toLowerCase();
      category.hidden = hiddenRaw === "1" || hiddenRaw === "on" || hiddenRaw === "true";
      const nextImage = String(categoryImages[index] ?? "").trim();
      if (nextImage) {
        category.image = nextImage;
      }
    });
    // Keep shopImages map in sync with category tiles (homepage + mega lookups).
    published.content.shopImages = Object.fromEntries(
      published.content.shopCategories.map((item) => [item.id, item.image]),
    );
    // Shop mega-menu cards that share a category href inherit the tile image when
    // the mega card itself was not given a new upload this publish.
    const shopByHref = new Map(published.content.shopCategories.map((item) => [item.href, item.image]));
    for (const menuId of MEGA_MENU_IDS) {
      const images = megaCardImages[menuId] ?? [];
      published.content.megaMenus[menuId] = {
        ...published.content.megaMenus[menuId],
        cards: published.content.megaMenus[menuId].cards.map((card, index) => {
          const explicit = String(images[index] ?? "").trim();
          if (explicit) {
            return { ...card, image: explicit };
          }
          const fromShop = shopByHref.get(card.href);
          if (fromShop) {
            return { ...card, image: fromShop };
          }
          return card;
        }),
      };
    }
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
