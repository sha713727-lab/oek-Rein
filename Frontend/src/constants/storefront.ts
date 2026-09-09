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
  heroHeadline,
  heroProductAlt,
  heroProductSrc,
  heroSupport,
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

export const SHOP_CATEGORY_ICONS = ["flower", "drop", "dropper", "leaf", "sparkle"] as const;

export type StorefrontContent = {
  heroHeadline: string;
  heroSupport: string;
  heroProductSrc: string;
  heroProductAlt: string;
  brandStoryPrimarySrc: string;
  brandStorySecondarySrc: string;
  brandStoryPortraitSrc: string;
  brandStoryLead: string;
  brandStoryMid: string;
  brandStoryEnd: string;
  productHighlightsImage: string;
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
  bg: "#f5f2ee",
  primary: "#3f3734",
  secondary: "#c4b6a6",
  accent: "#96976c",
  mint: "#d5e4cf",
  blush: "#f0c5bf",
};

export const DEFAULT_NAV_LINKS: StorefrontNavLink[] = NAV_ITEMS.map((item) => ({
  id: item.id,
  label: item.label,
  path: item.path,
  hidden: false,
}));

export const DEFAULT_SHOP_CATEGORIES: StorefrontShopCategory[] = SHOP_RANGE_CATEGORIES.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  href: item.href,
  image: item.image,
  alt: item.alt,
  icon: item.icon,
  color: item.tone === "mint" ? DEFAULT_STOREFRONT_THEME.mint : DEFAULT_STOREFRONT_THEME.blush,
  hidden: false,
}));

export const DEFAULT_STOREFRONT_CONTENT: StorefrontContent = {
  heroHeadline,
  heroSupport,
  heroProductSrc,
  heroProductAlt,
  brandStoryPrimarySrc,
  brandStorySecondarySrc,
  brandStoryPortraitSrc,
  brandStoryLead,
  brandStoryMid,
  brandStoryEnd,
  productHighlightsImage: PRODUCT_HIGHLIGHTS_IMAGE,
  glowStatsImage: GLOW_STATS_IMAGE,
  faqImage: HOME_FAQ_IMAGE,
  faqImageAlt: HOME_FAQ_IMAGE_ALT,
  faqItems: HOME_FAQ.map((item) => ({ id: item.id, question: item.question, answer: item.answer })),
  features: FEATURES.map((item) => ({ title: item.title, description: item.description, icon: item.icon })),
  footerStatementLead,
  footerStatementEnd,
  socialFacebook: FOOTER_SOCIAL.find((item) => item.id === "facebook")?.href ?? "https://facebook.com/zermae",
  socialInstagram: FOOTER_SOCIAL.find((item) => item.id === "instagram")?.href ?? "https://instagram.com/zermae",
  socialPinterest: FOOTER_SOCIAL.find((item) => item.id === "pinterest")?.href ?? "https://pinterest.com/zermae",
  aboutCopy:
    "From serums and creams to cleansers and body treatments, Zermae is designed for people who want considered products, honest language, and a routine that stays simple.",
  contactLead:
    "We would love to hear from you — whether you have a question about an order, a formula, or your daily routine.",
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
  bestSellerColors: BEST_SELLERS.map((item) =>
    item.tone === "mint" ? DEFAULT_STOREFRONT_THEME.mint : DEFAULT_STOREFRONT_THEME.blush,
  ),
  heroStageColor: DEFAULT_STOREFRONT_THEME.mint,
  productCardColors: [DEFAULT_STOREFRONT_THEME.blush, DEFAULT_STOREFRONT_THEME.mint, "#efe4ee"],
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

function asImageMap(value: unknown, fallback: Record<string, string>): Record<string, string> {
  const record = asRecord(value);
  const next = { ...fallback };
  for (const key of Object.keys(fallback)) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      continue;
    }
    next[key] = String(record[key] ?? "").trim();
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
  return fallback.map((item, index) => asHex(source[index], item));
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
  return value.slice(0, 12).map((item, index) => {
    const record = asRecord(item);
    const fallback = DEFAULT_NAV_LINKS[index] ?? { id: `nav-${index + 1}`, label: "Shop", path: "/collections/all", hidden: false };
    return {
      id: asText(record.id, `${fallback.id}-${index + 1}`),
      label: asText(record.label, fallback.label),
      path: asPath(record.path, fallback.path),
      hidden: asBool(record.hidden),
    };
  }).filter((item) => item.label && item.path);
}

function asShopCategories(
  value: unknown,
  images: Record<string, string>,
  colors: Record<string, string>,
): StorefrontShopCategory[] {
  if (!Array.isArray(value)) {
    return DEFAULT_SHOP_CATEGORIES.map((item) => ({
      ...item,
      image: images[item.id] || item.image,
      color: colors[item.id] || item.color,
    }));
  }
  return value.slice(0, 8).map((item, index) => {
    const record = asRecord(item);
    const fallback = DEFAULT_SHOP_CATEGORIES[index] ?? DEFAULT_SHOP_CATEGORIES[0]!;
    const id = asText(record.id, `${fallback.id}-${index + 1}`);
    const imageRaw = record.image;
    const image =
      imageRaw === undefined || imageRaw === null
        ? images[id] || fallback.image
        : String(imageRaw).trim();
    return {
      id,
      title: asStoredText(record.title, fallback.title),
      description: asStoredText(record.description, fallback.description),
      href: asPath(record.href, fallback.href),
      image,
      alt: asStoredText(record.alt, fallback.alt),
      icon: asIcon(record.icon, fallback.icon),
      color: asHex(record.color, colors[id] || fallback.color),
      hidden: asBool(record.hidden),
    };
  }).filter((item) => item.title && item.href);
}

export function resolveStorefrontTheme(raw: unknown): StorefrontTheme {
  const record = asRecord(raw);
  return {
    bg: asHex(record.bg, DEFAULT_STOREFRONT_THEME.bg),
    primary: asHex(record.primary, DEFAULT_STOREFRONT_THEME.primary),
    secondary: asHex(record.secondary, DEFAULT_STOREFRONT_THEME.secondary),
    accent: asHex(record.accent, DEFAULT_STOREFRONT_THEME.accent),
    mint: asHex(record.mint, DEFAULT_STOREFRONT_THEME.mint),
    blush: asHex(record.blush, DEFAULT_STOREFRONT_THEME.blush),
  };
}

function asFaqItems(value: unknown): StorefrontFaqItem[] {
  const fallback = DEFAULT_STOREFRONT_CONTENT.faqItems;
  if (!Array.isArray(value)) {
    return fallback;
  }
  return value
    .map((item, index) => {
      const record = asRecord(item);
      return {
        id: asText(record.id, fallback[index]?.id ?? `faq-${index + 1}`),
        question: asStoredText(record.question, fallback[index]?.question ?? ""),
        answer: asStoredText(record.answer, fallback[index]?.answer ?? ""),
      };
    })
    .filter((item) => item.question && item.answer)
    .slice(0, 8);
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
        icon: asText(record.icon, fallback[index]?.icon ?? "leaf"),
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
  const skus = Array.isArray(record.bestSellerSkus)
    ? record.bestSellerSkus.map((item) => String(item).trim().toUpperCase()).filter(Boolean).slice(0, 3)
    : [];
  const images = asImageMap(record.shopImages, DEFAULT_STOREFRONT_CONTENT.shopImages);
  const colors = asHexMap(record.shopCardColors, DEFAULT_STOREFRONT_CONTENT.shopCardColors);
  const shopCategories = asShopCategories(record.shopCategories, images, colors);
  const shopImages = Object.fromEntries(shopCategories.map((item) => [item.id, item.image]));
  const shopCardColors = Object.fromEntries(shopCategories.map((item) => [item.id, item.color]));
  return {
    heroHeadline: asStoredText(record.heroHeadline, DEFAULT_STOREFRONT_CONTENT.heroHeadline),
    heroSupport: asStoredText(record.heroSupport, DEFAULT_STOREFRONT_CONTENT.heroSupport),
    heroProductSrc: asStoredText(record.heroProductSrc, DEFAULT_STOREFRONT_CONTENT.heroProductSrc),
    heroProductAlt: asStoredText(record.heroProductAlt, DEFAULT_STOREFRONT_CONTENT.heroProductAlt),
    brandStoryPrimarySrc: asStoredText(record.brandStoryPrimarySrc, DEFAULT_STOREFRONT_CONTENT.brandStoryPrimarySrc),
    brandStorySecondarySrc: asStoredText(record.brandStorySecondarySrc, DEFAULT_STOREFRONT_CONTENT.brandStorySecondarySrc),
    brandStoryPortraitSrc: asStoredText(record.brandStoryPortraitSrc, DEFAULT_STOREFRONT_CONTENT.brandStoryPortraitSrc),
    brandStoryLead: asStoredText(record.brandStoryLead, DEFAULT_STOREFRONT_CONTENT.brandStoryLead),
    brandStoryMid: asStoredText(record.brandStoryMid, DEFAULT_STOREFRONT_CONTENT.brandStoryMid),
    brandStoryEnd: asStoredText(record.brandStoryEnd, DEFAULT_STOREFRONT_CONTENT.brandStoryEnd),
    productHighlightsImage: asStoredText(record.productHighlightsImage, DEFAULT_STOREFRONT_CONTENT.productHighlightsImage),
    glowStatsImage: asStoredText(record.glowStatsImage, DEFAULT_STOREFRONT_CONTENT.glowStatsImage),
    faqImage: asStoredText(record.faqImage, DEFAULT_STOREFRONT_CONTENT.faqImage),
    faqImageAlt: asStoredText(record.faqImageAlt, DEFAULT_STOREFRONT_CONTENT.faqImageAlt),
    faqItems: asFaqItems(record.faqItems),
    features: asFeatures(record.features),
    footerStatementLead: asStoredText(record.footerStatementLead, DEFAULT_STOREFRONT_CONTENT.footerStatementLead),
    footerStatementEnd: asStoredText(record.footerStatementEnd, DEFAULT_STOREFRONT_CONTENT.footerStatementEnd),
    socialFacebook: asStoredText(record.socialFacebook, DEFAULT_STOREFRONT_CONTENT.socialFacebook),
    socialInstagram: asStoredText(record.socialInstagram, DEFAULT_STOREFRONT_CONTENT.socialInstagram),
    socialPinterest: asStoredText(record.socialPinterest, DEFAULT_STOREFRONT_CONTENT.socialPinterest),
    aboutCopy: asStoredText(record.aboutCopy, DEFAULT_STOREFRONT_CONTENT.aboutCopy),
    contactLead: asStoredText(record.contactLead, DEFAULT_STOREFRONT_CONTENT.contactLead),
    supportPhone: asStoredText(record.supportPhone, DEFAULT_STOREFRONT_CONTENT.supportPhone),
    authLoginSrc: asStoredText(record.authLoginSrc, DEFAULT_STOREFRONT_CONTENT.authLoginSrc),
    authRegisterSrc: asStoredText(record.authRegisterSrc, DEFAULT_STOREFRONT_CONTENT.authRegisterSrc),
    authAdminSrc: asStoredText(record.authAdminSrc, DEFAULT_STOREFRONT_CONTENT.authAdminSrc),
    shopImages,
    shopCardColors,
    shopCategories,
    navLinks: asNavLinks(record.navLinks),
    collectionImages: asImageMap(record.collectionImages, DEFAULT_STOREFRONT_CONTENT.collectionImages),
    collectionTitles: asCollectionTitles(record.collectionTitles),
    bestSellerSkus: Array.isArray(record.bestSellerSkus) ? skus : DEFAULT_STOREFRONT_CONTENT.bestSellerSkus,
    bestSellerColors: asHexList(record.bestSellerColors, DEFAULT_STOREFRONT_CONTENT.bestSellerColors),
    heroStageColor: asHex(record.heroStageColor, DEFAULT_STOREFRONT_CONTENT.heroStageColor),
    productCardColors: asHexList(record.productCardColors, DEFAULT_STOREFRONT_CONTENT.productCardColors),
  };
}

export function themeToCss(theme: StorefrontTheme): string {
  return `:root{--color-brand-bg:${theme.bg};--color-brand-primary:${theme.primary};--color-brand-secondary:${theme.secondary};--color-brand-accent:${theme.accent};--color-brand-mint:${theme.mint};--color-brand-blush:${theme.blush};--color-text-main:${theme.primary};--color-text-sub:color-mix(in srgb,${theme.primary} 70%,transparent);--color-text-muted:color-mix(in srgb,${theme.primary} 40%,transparent);--color-brand-border:color-mix(in srgb,${theme.primary} 8%,transparent);}`;
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
