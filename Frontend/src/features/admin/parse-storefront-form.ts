import { type CommerceSettings, DEFAULT_COMMERCE_SETTINGS, resolveCommerceSettings } from "@/constants/commerce";
import {
  DEFAULT_STOREFRONT_CONTENT,
  resolveStorefrontContent,
  resolveStorefrontTheme,
  type StorefrontContent,
  type StorefrontTheme,
} from "@/constants/storefront";

export type StorefrontFormImages = {
  heroProductSrc: string;
  brandStoryPrimarySrc: string;
  brandStorySecondarySrc: string;
  brandStoryPortraitSrc: string;
  productHighlightsImage: string;
  glowStatsImage: string;
  faqImage: string;
  authLoginSrc: string;
  authRegisterSrc: string;
  authAdminSrc: string;
  categoryImages: string[];
  collectionImages: Record<string, string>;
};

export type StorefrontPublishPayload = {
  commerce: CommerceSettings;
  theme: StorefrontTheme;
  content: StorefrontContent;
};

export function storefrontPublishFromForm(formData: FormData, images: StorefrontFormImages): StorefrontPublishPayload {
  const collectionKeys = Object.keys(DEFAULT_STOREFRONT_CONTENT.collectionImages);
  const categoryCount = Math.min(8, Math.max(0, Number(formData.get("categoryCount") ?? 0)));
  const navCount = Math.min(12, Math.max(0, Number(formData.get("navCount") ?? 0)));
  const categoryIndexes = Array.from({ length: categoryCount }, (_, index) => index);
  const faqItems = DEFAULT_STOREFRONT_CONTENT.faqItems.map((item, index) => ({
    id: String(formData.get(`faqId_${index}`) ?? item.id),
    question: String(formData.get(`faqQuestion_${index}`) ?? item.question),
    answer: String(formData.get(`faqAnswer_${index}`) ?? item.answer),
  }));
  const features = DEFAULT_STOREFRONT_CONTENT.features.map((item, index) => ({
    title: String(formData.get(`featureTitle_${index}`) ?? item.title),
    description: String(formData.get(`featureDescription_${index}`) ?? item.description),
    icon: String(formData.get(`featureIcon_${index}`) ?? item.icon),
  }));
  const collectionTitles = Object.fromEntries(
    collectionKeys.map((key) => [
      key,
      {
        first: String(formData.get(`collectionFirst_${key}`) ?? DEFAULT_STOREFRONT_CONTENT.collectionTitles[key]?.first ?? ""),
        second: String(
          formData.get(`collectionSecond_${key}`) ?? DEFAULT_STOREFRONT_CONTENT.collectionTitles[key]?.second ?? "",
        ),
      },
    ]),
  );
  const theme = resolveStorefrontTheme({
    bg: formData.get("themeBg"),
    primary: formData.get("themePrimary"),
    secondary: formData.get("themeSecondary"),
    accent: formData.get("themeAccent"),
    mint: formData.get("themeMint"),
    blush: formData.get("themeBlush"),
  });
  const heroHeadline = String(formData.get("heroHeadline") ?? "");
  const shopCategories = categoryIndexes.map((index) => ({
    id: String(formData.get(`categoryId_${index}`) ?? `cat-${index + 1}`),
    title: String(formData.get(`categoryTitle_${index}`) ?? ""),
    description: String(formData.get(`categoryDescription_${index}`) ?? ""),
    href: String(formData.get(`categoryHref_${index}`) ?? "/collections/all"),
    image: images.categoryImages[index] ?? "",
    alt: String(formData.get(`categoryTitle_${index}`) ?? "Category"),
    icon: String(formData.get(`categoryIcon_${index}`) ?? "sparkle"),
    color: String(formData.get(`categoryColor_${index}`) ?? ""),
    hidden: formData.get(`categoryHidden_${index}`) === "on",
  }));
  const navLinks = Array.from({ length: navCount }, (_, index) => ({
    id: String(formData.get(`navId_${index}`) ?? `nav-${index + 1}`),
    label: String(formData.get(`navLabel_${index}`) ?? ""),
    path: String(formData.get(`navPath_${index}`) ?? "/collections/all"),
    hidden: formData.get(`navHidden_${index}`) === "on",
  }));
  return {
    theme,
    commerce: resolveCommerceSettings({
      currency: DEFAULT_COMMERCE_SETTINGS.currency,
      standardShippingFee: Number(formData.get("standardShippingFee") ?? 0),
      freeShippingThreshold: Number(formData.get("freeShippingThreshold") ?? 0),
      freeShippingEnabled: formData.get("freeShippingEnabled") === "on",
      taxEnabled: formData.get("taxEnabled") === "on",
      taxRate: Number(formData.get("taxRate") ?? 0),
      taxLabel: DEFAULT_COMMERCE_SETTINGS.taxLabel,
    }),
    content: resolveStorefrontContent({
      heroHeadline,
      heroSupport: formData.get("heroSupport"),
      heroProductSrc: images.heroProductSrc,
      heroProductAlt: formData.get("heroProductAlt") || heroHeadline,
      brandStoryPrimarySrc: images.brandStoryPrimarySrc,
      brandStorySecondarySrc: images.brandStorySecondarySrc,
      brandStoryPortraitSrc: images.brandStoryPortraitSrc,
      productHighlightsImage: images.productHighlightsImage,
      glowStatsImage: images.glowStatsImage,
      faqImage: images.faqImage,
      faqImageAlt: formData.get("faqImageAlt") || "Frequently asked questions",
      faqItems,
      features,
      brandStoryLead: formData.get("brandStoryLead"),
      brandStoryMid: formData.get("brandStoryMid"),
      brandStoryEnd: formData.get("brandStoryEnd"),
      footerStatementLead: formData.get("footerStatementLead"),
      footerStatementEnd: formData.get("footerStatementEnd"),
      socialFacebook: formData.get("socialFacebook"),
      socialInstagram: formData.get("socialInstagram"),
      socialPinterest: formData.get("socialPinterest"),
      aboutCopy: formData.get("aboutCopy"),
      contactLead: formData.get("contactLead"),
      authLoginSrc: images.authLoginSrc,
      authRegisterSrc: images.authRegisterSrc,
      authAdminSrc: images.authAdminSrc,
      shopCategories,
      navLinks,
      collectionImages: images.collectionImages,
      collectionTitles,
      bestSellerSkus: [formData.get("bestSellerSku1"), formData.get("bestSellerSku2"), formData.get("bestSellerSku3")],
      bestSellerColors: [formData.get("bestSellerColor1"), formData.get("bestSellerColor2"), formData.get("bestSellerColor3")],
      heroStageColor: formData.get("heroStageColor"),
      productCardColors: [
        formData.get("productCardColor1"),
        formData.get("productCardColor2"),
        formData.get("productCardColor3"),
      ],
    }),
  };
}
