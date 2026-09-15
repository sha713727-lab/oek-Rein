import type { CSSProperties } from "react";

import {
  brandStoryEnd,
  brandStoryLead,
  brandStoryMid,
  brandStoryPortraitSrc,
  brandStoryPrimarySrc,
  brandStorySecondarySrc,
  footerStatementEnd,
  footerStatementLead,
  brandName,
  heroHeadline,
  heroProductAlt,
  heroProductSrc,
  heroSupport,
  heroVideoSrc,
} from "@/constants/brand";
import {
  AUTH_BANNERS,
  BEST_SELLERS,
  COLLECTION_HEROES,
  FEATURES,
  FOOTER_SOCIAL,
  GLOW_STATS_IMAGE,
  HOME_FAQ,
  HOME_FAQ_IMAGE,
  HOME_FAQ_IMAGE_ALT,
  NAV_ITEMS,
  PRODUCT_HIGHLIGHTS_IMAGE,
  SHOP_RANGE_CATEGORIES,
  SUPPORT_PHONE_LOCAL,
} from "@/constants/site";
import { resolvePublicAssetSrc } from "@/lib/public-assets";

export type StorefrontTheme = {
  bg: string;
  primary: string;
  secondary: string;
  accent: string;
  mint: string;
  blush: string;
};

export type StorefrontFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type StorefrontFeature = {
  title: string;
  description: string;
  icon: string;
};

export type StorefrontCollectionTitle = {
  first: string;
  second: string;
};

export type StorefrontNavLink = {
  id: string;
  label: string;
  path: string;
  hidden: boolean;
};

export type StorefrontShopCategory = {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  alt: string;
  icon: string;
  color: string;
  hidden: boolean;
};

export const SHOP_CATEGORY_ICONS = ["saddle", "bridle", "halter", "leather", "horseshoe", "stitch"] as const;

/** Orbit slots around the product-highlights hero (CSS modifiers keep legacy ids). */
export const PRODUCT_HIGHLIGHTS_FLOAT_SLOTS = [
  { id: "seeds", label: "Bottom left", size: 96 },
  { id: "slice", label: "Top right", size: 68 },
  { id: "leaf", label: "Top left", size: 80 },
  { id: "petal", label: "Bottom right", size: 72 },
  { id: "droplet", label: "Top center", size: 54 },
] as const;

export type ProductHighlightsFloatId = (typeof PRODUCT_HIGHLIGHTS_FLOAT_SLOTS)[number]["id"];

export type StorefrontContent = {
  heroHeadline: string;
  heroSupport: string;
  heroProductSrc: string;
  heroProductAlt: string;
  /** Homepage hero cutout video (MP4/WEBM). */
  heroVideoSrc: string;
  brandStoryPrimarySrc: string;
  brandStorySecondarySrc: string;
  brandStoryPortraitSrc: string;
  brandStoryLead: string;
  brandStoryMid: string;
  brandStoryEnd: string;
  productHighlightsImage: string;
  /** Cut-outs that drift around the product-highlights hero. Keys match CSS float modifiers. */
  productHighlightsFloats: Record<ProductHighlightsFloatId, string>;
  glowStatsImage: string;
  faqImage: string;
  faqImageAlt: string;
  faqItems: StorefrontFaqItem[];
  features: StorefrontFeature[];
  footerStatementLead: string;
  footerStatementEnd: string;
  socialFacebook: string;
  socialInstagram: string;
  socialPinterest: string;
  aboutCopy: string;
  contactLead: string;
  /** Shop WhatsApp / contact phone (local or E.164). */
  supportPhone: string;
  authLoginSrc: string;
  authRegisterSrc: string;
  authAdminSrc: string;
  shopImages: Record<string, string>;
  shopCardColors: Record<string, string>;
  collectionImages: Record<string, string>;
  collectionTitles: Record<string, StorefrontCollectionTitle>;
  bestSellerSkus: string[];
  bestSellerColors: string[];
  heroStageColor: string;
  productCardColors: string[];
  navLinks: StorefrontNavLink[];
  shopCategories: StorefrontShopCategory[];
};

export const DEFAULT_STOREFRONT_THEME: StorefrontTheme = {
  bg: "#f4f1eb",
  primary: "#204e4a",
  secondary: "#859361",
  accent: "#e1e53f",
  mint: "#d0d5d2",
  blush: "#f3f5c8",
};

/** Soft Vol-inspired fills for category and product cards. */
export const HORSE_COAT = {
  /** Soft lime wash — Vol accent family. */
  dappleGrey: "#859361",
  /** Bright lime — primary accent. */
  sorrel: "#e1e53f",
  /** Soft teal from forest green. */
  blueRoan: "#a8c5c1",
} as const;

export const CATEGORY_DAPPLE_GREY = HORSE_COAT.dappleGrey;
export const CATEGORY_SORREL = HORSE_COAT.sorrel;
export const PRODUCT_CARD_COATS = [HORSE_COAT.sorrel, HORSE_COAT.dappleGrey, HORSE_COAT.blueRoan];

const LEGACY_HORSE_COLORS: Record<string, string> = {
  "#d5e4cf": HORSE_COAT.dappleGrey,
  "#f0c5bf": HORSE_COAT.sorrel,
  "#daae00": HORSE_COAT.sorrel,
  "#efe4ee": HORSE_COAT.blueRoan,
  "#96976c": HORSE_COAT.dappleGrey,
  "#c8c6bc": HORSE_COAT.dappleGrey,
  "#d9b0a2": HORSE_COAT.sorrel,
  "#8f9d6e": HORSE_COAT.dappleGrey,
  "#b7c49a": HORSE_COAT.dappleGrey,
  /* Previous Saddlera terracotta / brown coats → Vol palette */
  "#959486": HORSE_COAT.dappleGrey,
  "#c15a3a": HORSE_COAT.sorrel,
  "#7a8896": HORSE_COAT.blueRoan,
  "#3a221c": DEFAULT_STOREFRONT_THEME.primary,
  "#6b2f22": DEFAULT_STOREFRONT_THEME.primary,
  "#4a2219": DEFAULT_STOREFRONT_THEME.primary,
};

function categoryCardColor(index: number): string {
  return PRODUCT_CARD_COATS[index % PRODUCT_CARD_COATS.length]!;
}

export function resolveHorseCoatColor(value: string | null | undefined, fallback: string): string {
  const hex = String(value ?? "").trim().toLowerCase();
  if (!hex) {
    return fallback;
  }
  return LEGACY_HORSE_COLORS[hex] ?? hex;
}

function resolveCategoryCardColor(value: string, fallback: string): string {
  return resolveHorseCoatColor(value, fallback);
}

export const DEFAULT_NAV_LINKS: StorefrontNavLink[] = NAV_ITEMS.map((item) => ({
  id: item.id,
  label: item.label,
  path: item.path,
  hidden: false,
}));

export const DEFAULT_SHOP_CATEGORIES: StorefrontShopCategory[] = SHOP_RANGE_CATEGORIES.map((item, index) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  href: item.href,
  image: item.image,
  alt: item.alt,
  icon: item.icon,
  color: categoryCardColor(index),
  hidden: false,
}));

export const DEFAULT_STOREFRONT_CONTENT: StorefrontContent = {
  heroHeadline,
  heroSupport,
  heroProductSrc,
  heroProductAlt,
  heroVideoSrc,
  brandStoryPrimarySrc,
  brandStorySecondarySrc,
  brandStoryPortraitSrc,
  brandStoryLead,
  brandStoryMid,
  brandStoryEnd,
  productHighlightsImage: PRODUCT_HIGHLIGHTS_IMAGE,
  productHighlightsFloats: {
    seeds: "/assets/images/western_floral_bridle.png",
    slice: "/assets/images/hourse_shoe.png",
    leaf: "/assets/images/western_floral_halter.png",
    petal: "/assets/images/saddlera_leather_care.png",
    droplet: "/assets/images/western_floral_new_arrivals.png",
  },
  glowStatsImage: GLOW_STATS_IMAGE,
  faqImage: HOME_FAQ_IMAGE,
  faqImageAlt: HOME_FAQ_IMAGE_ALT,
  faqItems: HOME_FAQ.map((item) => ({ id: item.id, question: item.question, answer: item.answer })),
  features: FEATURES.map((item) => ({ title: item.title, description: item.description, icon: item.icon })),
  footerStatementLead,
  footerStatementEnd,
  socialFacebook: FOOTER_SOCIAL.find((item) => item.id === "facebook")?.href ?? "https://facebook.com/saddlera",
  socialInstagram: FOOTER_SOCIAL.find((item) => item.id === "instagram")?.href ?? "https://instagram.com/saddlera",
  socialPinterest: FOOTER_SOCIAL.find((item) => item.id === "pinterest")?.href ?? "https://pinterest.com/saddlera",
  aboutCopy:
    "Saddlera is a premium handcrafted Pakistani leather equestrian brand for North America. From saddles and bridles to halters and leather care, every piece is built for riders who want honest materials, careful stitching, and gear that lasts.",
  contactLead:
    "Questions about an order, a fit, or shipping to the US or Canada? We are here to help.",
  supportPhone: SUPPORT_PHONE_LOCAL,
  authLoginSrc: AUTH_BANNERS.login.src,
  authRegisterSrc: AUTH_BANNERS.register.src,
  authAdminSrc: AUTH_BANNERS.adminLogin.src,
  shopCategories: DEFAULT_SHOP_CATEGORIES,
  shopImages: Object.fromEntries(DEFAULT_SHOP_CATEGORIES.map((item) => [item.id, item.image])),
  shopCardColors: Object.fromEntries(DEFAULT_SHOP_CATEGORIES.map((item) => [item.id, item.color])),
  collectionImages: Object.fromEntries(Object.entries(COLLECTION_HEROES).map(([key, value]) => [key, value.image])),
  collectionTitles: Object.fromEntries(
    Object.entries(COLLECTION_HEROES).map(([key, value]) => [key, { first: value.first, second: value.second }]),
  ),
  bestSellerSkus: BEST_SELLERS.map((item) => item.sku),
  bestSellerColors: BEST_SELLERS.map((_, index) => PRODUCT_CARD_COATS[index % PRODUCT_CARD_COATS.length]!),
  heroStageColor: DEFAULT_STOREFRONT_THEME.mint,
  productCardColors: [...PRODUCT_CARD_COATS],
  navLinks: DEFAULT_NAV_LINKS,
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asHex(value: unknown, fallback: string): string {
  const text = String(value ?? "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(text) ? text : fallback;
}

function asText(value: unknown, fallback: string): string {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : fallback;
}

/** Missing/null → fallback. Explicit empty string is kept so CMS clears persist. */
function asStoredText(value: unknown, fallback: string): string {
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value).trim();
}

function asAssetSrc(value: unknown, fallback: string): string {
  return resolvePublicAssetSrc(asStoredText(value, fallback));
}

function asBrandText(value: unknown, fallback: string): string {
  return asStoredText(value, fallback).replace(/zermaé/gi, brandName).replace(/Saddlera/g, brandName).replace(/zermae/gi, brandName);
}

function asImageMap(value: unknown, fallback: Record<string, string>): Record<string, string> {
  const record = asRecord(value);
  const next = { ...fallback };
  for (const key of Object.keys(fallback)) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      continue;
    }
    next[key] = resolvePublicAssetSrc(String(record[key] ?? "").trim());
  }
  for (const key of Object.keys(next)) {
    next[key] = resolvePublicAssetSrc(next[key] ?? "");
  }
  return next;
}

function asHexMap(value: unknown, fallback: Record<string, string>): Record<string, string> {
  const record = asRecord(value);
  const next = { ...fallback };
  for (const key of Object.keys(fallback)) {
    next[key] = asHex(record[key], fallback[key] ?? DEFAULT_STOREFRONT_THEME.blush);
  }
  return next;
}

function asHexList(value: unknown, fallback: string[]): string[] {
  const source = Array.isArray(value) ? value : [];
  return fallback.map((item, index) => resolveHorseCoatColor(asHex(source[index], item), item));
}

function asBool(value: unknown): boolean {
  return value === true || value === "on" || value === "true" || value === 1;
}

function asPath(value: unknown, fallback: string): string {
  const text = String(value ?? "").trim();
  if (!text.startsWith("/") || text.startsWith("//") || /[\s<>'"`]/.test(text)) {
    return fallback;
  }
  return text.slice(0, 160);
}

function asIcon(value: unknown, fallback: string): string {
  const text = String(value ?? "").trim();
  return (SHOP_CATEGORY_ICONS as readonly string[]).includes(text) ? text : fallback;
}

function asNavLinks(value: unknown): StorefrontNavLink[] {
  if (!Array.isArray(value)) {
    return DEFAULT_NAV_LINKS;
  }
  const links = value.slice(0, 12).map((item, index) => {
    const record = asRecord(item);
    const fallback = DEFAULT_NAV_LINKS[index] ?? { id: `nav-${index + 1}`, label: "Shop", path: "/collections/all", hidden: false };
    let id = asText(record.id, `${fallback.id}-${index + 1}`);
    let label = asText(record.label, fallback.label);
    let path = asPath(record.path, fallback.path);
    if (id === "navHalters" || path === "/collections/halters" || label.toLowerCase() === "halters") {
      id = "navReins";
      label = "Reins";
      path = "/collections/reins";
    }
    return {
      id,
      label,
      path,
      hidden: asBool(record.hidden),
    };
  }).filter((item) => item.label && item.path);

  // Prefer permanent default nav when CMS still has an outdated shorter set.
  if (links.length === 0) {
    return DEFAULT_NAV_LINKS;
  }
  return links;
}

function asShopCategories(
  value: unknown,
  images: Record<string, string>,
  colors: Record<string, string>,
): StorefrontShopCategory[] {
  const incoming = Array.isArray(value)
    ? value.map((item) => asRecord(item)).filter((record) => Object.keys(record).length > 0)
    : [];
  const byId = new Map(incoming.map((record) => [asText(record.id, ""), record]));

  // Permanent shop tiles always win — CMS may edit copy/images, never drop or reorder the set.
  return DEFAULT_SHOP_CATEGORIES.map((fallback) => {
    const record = byId.get(fallback.id) ?? {};
    const imageRaw = record.image;
    const image = resolvePublicAssetSrc(
      imageRaw === undefined || imageRaw === null
        ? images[fallback.id] || fallback.image
        : String(imageRaw).trim() || fallback.image,
    );
    return {
      id: fallback.id,
      title: asStoredText(record.title, fallback.title),
      description: asStoredText(record.description, fallback.description),
      href: fallback.href,
      image,
      alt: asStoredText(record.alt, fallback.alt),
      icon: asIcon(record.icon, fallback.icon),
      color: resolveCategoryCardColor(
        asHex(record.color, colors[fallback.id] || fallback.color),
        fallback.color,
      ),
      hidden: asBool(record.hidden),
    };
  });
}

const LEGACY_THEME_COLORS: Record<string, string> = {
  "#96976c": DEFAULT_STOREFRONT_THEME.secondary,
  "#d5e4cf": DEFAULT_STOREFRONT_THEME.mint,
  "#f0c5bf": DEFAULT_STOREFRONT_THEME.blush,
  /* Previous terracotta / brown Saddlera defaults → Vol palette */
  "#f5f2ee": DEFAULT_STOREFRONT_THEME.bg,
  "#3f3734": DEFAULT_STOREFRONT_THEME.primary,
  "#c4b6a6": DEFAULT_STOREFRONT_THEME.secondary,
  "#c15a3a": DEFAULT_STOREFRONT_THEME.accent,
  "#c8c6bc": DEFAULT_STOREFRONT_THEME.mint,
  "#d9b0a2": DEFAULT_STOREFRONT_THEME.blush,
  "#3a221c": DEFAULT_STOREFRONT_THEME.primary,
  "#6b2f22": DEFAULT_STOREFRONT_THEME.primary,
  "#4a2219": DEFAULT_STOREFRONT_THEME.primary,
  "#a94a2e": DEFAULT_STOREFRONT_THEME.accent,
};

function resolveThemeColor(value: unknown, fallback: string): string {
  const hex = asHex(value, fallback).toLowerCase();
  return LEGACY_THEME_COLORS[hex] ?? hex;
}

export function resolveStorefrontTheme(raw: unknown): StorefrontTheme {
  const record = asRecord(raw);
  return {
    bg: resolveThemeColor(record.bg, DEFAULT_STOREFRONT_THEME.bg),
    primary: resolveThemeColor(record.primary, DEFAULT_STOREFRONT_THEME.primary),
    secondary: resolveThemeColor(record.secondary, DEFAULT_STOREFRONT_THEME.secondary),
    accent: resolveThemeColor(record.accent, DEFAULT_STOREFRONT_THEME.accent),
    mint: resolveThemeColor(record.mint, DEFAULT_STOREFRONT_THEME.mint),
    blush: resolveThemeColor(record.blush, DEFAULT_STOREFRONT_THEME.blush),
  };
}

function asFaqItems(value: unknown): StorefrontFaqItem[] {
  const fallback = DEFAULT_STOREFRONT_CONTENT.faqItems;
  if (!Array.isArray(value)) {
    return fallback;
  }
  const seen = new Set<string>();
  const items = value
    .map((item, index) => {
      const record = asRecord(item);
      const preferred = asText(record.id, fallback[index]?.id ?? `faq-${index + 1}`);
      let id = preferred;
      if (seen.has(id)) {
        id = `${preferred}-${index + 1}`;
      }
      seen.add(id);
      return {
        id,
        question: asBrandText(record.question, fallback[index]?.question ?? ""),
        answer: asBrandText(record.answer, fallback[index]?.answer ?? ""),
      };
    })
    .filter((item) => item.question && item.answer)
    .slice(0, 8);

  // Prefer canonical default FAQ set when CMS has stale/duplicate entries from older publishes.
  if (items.length === 0) {
    return fallback;
  }
  return items;
}

function asFeatures(value: unknown): StorefrontFeature[] {
  const fallback = DEFAULT_STOREFRONT_CONTENT.features;
  if (!Array.isArray(value)) {
    return fallback;
  }
  return value
    .map((item, index) => {
      const record = asRecord(item);
      return {
        title: asStoredText(record.title, fallback[index]?.title ?? ""),
        description: asStoredText(record.description, fallback[index]?.description ?? ""),
        icon: asText(record.icon, fallback[index]?.icon ?? "leather"),
      };
    })
    .filter((item) => item.title && item.description)
    .slice(0, 4);
}

function asCollectionTitles(value: unknown): Record<string, StorefrontCollectionTitle> {
  const fallback = DEFAULT_STOREFRONT_CONTENT.collectionTitles;
  const record = asRecord(value);
  const next: Record<string, StorefrontCollectionTitle> = { ...fallback };
  for (const key of Object.keys(fallback)) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      continue;
    }
    const item = asRecord(record[key]);
    const current = fallback[key];
    if (!current) {
      continue;
    }
    next[key] = {
      first: asStoredText(item.first, current.first),
      second: asStoredText(item.second, current.second),
    };
  }
  return next;
}

export function resolveStorefrontContent(raw: unknown): StorefrontContent {
  const record = asRecord(raw);
  const LEGACY_BEST_SELLER_SKUS: Record<string, string> = {
    "ZM-HAL-001": "ZM-SHO-001",
    "ZM-LUMIE-001": "ZM-SHO-001",
    "ZM-VITC-001": "ZM-SAD-001",
    "ZM-PDRN-001": "ZM-BRI-001",
  };
  const skus = (
    Array.isArray(record.bestSellerSkus)
      ? record.bestSellerSkus.map((item) => String(item).trim().toUpperCase()).filter(Boolean)
      : []
  )
    .map((sku) => LEGACY_BEST_SELLER_SKUS[sku] ?? sku)
    .slice(0, 3);
  const images = asImageMap(record.shopImages, DEFAULT_STOREFRONT_CONTENT.shopImages);
  const colors = asHexMap(record.shopCardColors, DEFAULT_STOREFRONT_CONTENT.shopCardColors);
  const shopCategories = asShopCategories(record.shopCategories, images, colors);
  const shopImages = Object.fromEntries(shopCategories.map((item) => [item.id, item.image]));
  const shopCardColors = Object.fromEntries(shopCategories.map((item) => [item.id, item.color]));
  return {
    heroHeadline: asStoredText(record.heroHeadline, DEFAULT_STOREFRONT_CONTENT.heroHeadline),
    heroSupport: asStoredText(record.heroSupport, DEFAULT_STOREFRONT_CONTENT.heroSupport),
    heroProductSrc: asAssetSrc(record.heroProductSrc, DEFAULT_STOREFRONT_CONTENT.heroProductSrc),
    heroProductAlt: asStoredText(record.heroProductAlt, DEFAULT_STOREFRONT_CONTENT.heroProductAlt),
    heroVideoSrc: asAssetSrc(record.heroVideoSrc, DEFAULT_STOREFRONT_CONTENT.heroVideoSrc),
    brandStoryPrimarySrc: asAssetSrc(record.brandStoryPrimarySrc, DEFAULT_STOREFRONT_CONTENT.brandStoryPrimarySrc),
    brandStorySecondarySrc: asAssetSrc(record.brandStorySecondarySrc, DEFAULT_STOREFRONT_CONTENT.brandStorySecondarySrc),
    brandStoryPortraitSrc: asAssetSrc(record.brandStoryPortraitSrc, DEFAULT_STOREFRONT_CONTENT.brandStoryPortraitSrc),
    brandStoryLead: asStoredText(record.brandStoryLead, DEFAULT_STOREFRONT_CONTENT.brandStoryLead),
    brandStoryMid: asStoredText(record.brandStoryMid, DEFAULT_STOREFRONT_CONTENT.brandStoryMid),
    brandStoryEnd: asStoredText(record.brandStoryEnd, DEFAULT_STOREFRONT_CONTENT.brandStoryEnd),
    productHighlightsImage: asAssetSrc(record.productHighlightsImage, DEFAULT_STOREFRONT_CONTENT.productHighlightsImage),
    productHighlightsFloats: asImageMap(
      record.productHighlightsFloats,
      DEFAULT_STOREFRONT_CONTENT.productHighlightsFloats,
    ) as StorefrontContent["productHighlightsFloats"],
    glowStatsImage: asAssetSrc(record.glowStatsImage, DEFAULT_STOREFRONT_CONTENT.glowStatsImage),
    faqImage: asAssetSrc(record.faqImage, DEFAULT_STOREFRONT_CONTENT.faqImage),
    faqImageAlt: asStoredText(record.faqImageAlt, DEFAULT_STOREFRONT_CONTENT.faqImageAlt),
    faqItems: asFaqItems(record.faqItems),
    features: asFeatures(record.features),
    footerStatementLead: asBrandText(record.footerStatementLead, DEFAULT_STOREFRONT_CONTENT.footerStatementLead),
    footerStatementEnd: asBrandText(record.footerStatementEnd, DEFAULT_STOREFRONT_CONTENT.footerStatementEnd),
    socialFacebook: asStoredText(record.socialFacebook, DEFAULT_STOREFRONT_CONTENT.socialFacebook),
    socialInstagram: asStoredText(record.socialInstagram, DEFAULT_STOREFRONT_CONTENT.socialInstagram),
    socialPinterest: asStoredText(record.socialPinterest, DEFAULT_STOREFRONT_CONTENT.socialPinterest),
    aboutCopy: asBrandText(record.aboutCopy, DEFAULT_STOREFRONT_CONTENT.aboutCopy),
    contactLead: asStoredText(record.contactLead, DEFAULT_STOREFRONT_CONTENT.contactLead),
    supportPhone: asStoredText(record.supportPhone, DEFAULT_STOREFRONT_CONTENT.supportPhone),
    authLoginSrc: asAssetSrc(record.authLoginSrc, DEFAULT_STOREFRONT_CONTENT.authLoginSrc),
    authRegisterSrc: asAssetSrc(record.authRegisterSrc, DEFAULT_STOREFRONT_CONTENT.authRegisterSrc),
    authAdminSrc: asAssetSrc(record.authAdminSrc, DEFAULT_STOREFRONT_CONTENT.authAdminSrc),
    shopImages,
    shopCardColors,
    shopCategories,
    navLinks: asNavLinks(record.navLinks),
    collectionImages: asImageMap(record.collectionImages, DEFAULT_STOREFRONT_CONTENT.collectionImages),
    collectionTitles: asCollectionTitles(record.collectionTitles),
    bestSellerSkus: skus.length > 0 ? skus : DEFAULT_STOREFRONT_CONTENT.bestSellerSkus,
    bestSellerColors: asHexList(record.bestSellerColors, DEFAULT_STOREFRONT_CONTENT.bestSellerColors),
    heroStageColor: asHex(record.heroStageColor, DEFAULT_STOREFRONT_CONTENT.heroStageColor),
    productCardColors: asHexList(record.productCardColors, DEFAULT_STOREFRONT_CONTENT.productCardColors),
  };
}

export function themeToCss(theme: StorefrontTheme): string {
  return `:root{--color-brand-bg:${theme.bg};--color-brand-primary:${theme.primary};--color-brand-secondary:${theme.secondary};--color-brand-accent:${theme.accent};--color-brand-mint:${theme.mint};--color-brand-blush:${theme.blush};--color-text-main:${theme.primary};--color-text-sub:color-mix(in srgb,${theme.primary} 70%,transparent);--color-text-muted:color-mix(in srgb,${theme.primary} 40%,transparent);--color-brand-border:color-mix(in srgb,${theme.primary} 10%,transparent);--vd-green:${theme.primary};--vd-green-soft:color-mix(in srgb,${theme.primary} 10%,transparent);--vd-lime:${theme.accent};--vd-lime-deep:color-mix(in srgb,${theme.accent} 82%,#142221);--vd-sage:${theme.secondary};--vd-sage-deep:color-mix(in srgb,${theme.secondary} 82%,#142221);--vd-cream:${theme.bg};--vd-body:#666666;--vd-buckskin:${theme.secondary};--vd-ribbon:${theme.primary};--vd-ribbon-deep:color-mix(in srgb,${theme.primary} 82%,#000);--vd-ribbon-text:${theme.accent};--vd-sorrel:${theme.accent};--vd-dapple:${theme.secondary};--vd-footer:${theme.primary};}`;
}

export function formatMoney(amount: number, currency = "PKR"): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export function tileStyle(color: string): CSSProperties {
  return { ["--tile-color"]: color } as CSSProperties;
}

export function visibleNavLinks(content: StorefrontContent): StorefrontNavLink[] {
  return content.navLinks.filter((item) => !item.hidden);
}

export function visibleShopCategories(content: StorefrontContent): StorefrontShopCategory[] {
  return content.shopCategories.filter((item) => !item.hidden);
}

export function resolveNavImages(content: StorefrontContent): Record<string, { src: string; tone: "blush" | "mint" }> {
  const next: Record<string, { src: string; tone: "blush" | "mint" }> = {};
  const olive = DEFAULT_STOREFRONT_THEME.mint.toLowerCase();
  for (const link of content.navLinks) {
    const slug = link.path.replace(/^\/collections\//, "").replace(/^\//, "");
    const category = content.shopCategories.find((item) => item.id === slug || item.href === link.path);
    const src = category?.image || content.shopImages[slug] || content.collectionImages[slug] || "";
    const color = (category?.color || content.shopCardColors[slug] || DEFAULT_STOREFRONT_THEME.blush).toLowerCase();
    next[link.id] = {
      src,
      tone: color === olive ? "mint" : "blush",
    };
  }
  return next;
}
