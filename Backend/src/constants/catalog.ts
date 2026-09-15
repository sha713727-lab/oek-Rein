export const PRODUCT_CATEGORIES = [
  "new-arrivals",
  "saddles",
  "bridles",
  "halters",
  "care",
  "engraved-saddles",
  "western-saddles",
  "crystal-rhinestone",
  "studded-leather",
  "custom-colors",
  "personalized",
  "complete-sets",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const DISCOUNT_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
} as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES];

export const FRONTEND_TO_BACKEND_CATEGORY: Record<string, ProductCategory | null> = {
  new: "new-arrivals",
  saddles: "saddles",
  bridles: "bridles",
  halters: "halters",
  reins: "halters",
  care: "care",
  "engraved-saddles": "engraved-saddles",
  "western-saddles": "western-saddles",
  "crystal-rhinestone": "crystal-rhinestone",
  "studded-leather": "studded-leather",
  "custom-colors": "custom-colors",
  personalized: "personalized",
  "complete-sets": "complete-sets",
  // Legacy Zermae slugs (existing DB rows / bookmarks)
  serums: "saddles",
  creams: "bridles",
  cleansers: "halters",
  body: "care",
  all: null,
};

export const BACKEND_TO_FRONTEND_CATEGORY: Record<string, string> = {
  "new-arrivals": "new",
  saddles: "saddles",
  bridles: "bridles",
  halters: "halters",
  care: "care",
  "engraved-saddles": "engraved-saddles",
  "western-saddles": "western-saddles",
  "crystal-rhinestone": "crystal-rhinestone",
  "studded-leather": "studded-leather",
  "custom-colors": "custom-colors",
  personalized: "personalized",
  "complete-sets": "complete-sets",
  serums: "saddles",
  creams: "bridles",
  cleansers: "halters",
  "body-care": "care",
};

export function normalizeCategoryFilter(category: string | undefined): ProductCategory | undefined {
  if (!category || category === "all") {
    return undefined;
  }
  const mapped = FRONTEND_TO_BACKEND_CATEGORY[category];
  if (mapped) {
    return mapped;
  }
  if ((PRODUCT_CATEGORIES as readonly string[]).includes(category)) {
    return category as ProductCategory;
  }
  return undefined;
}

export function toFrontendCategory(category: string): string {
  return BACKEND_TO_FRONTEND_CATEGORY[category] ?? category;
}

export const CATEGORY_LABELS: Record<string, string> = {
  new: "New Arrivals",
  saddles: "Saddles",
  bridles: "Bridles",
  halters: "Reins",
  reins: "Reins",
  care: "Leather Care",
  "new-arrivals": "New Arrivals",
  "engraved-saddles": "Engraved Saddles",
  "western-saddles": "Western Saddles",
  "crystal-rhinestone": "Crystal - Rhinestone",
  "studded-leather": "Studded Leather",
  "custom-colors": "Custom Colors",
  personalized: "Personalized Name/Logo",
  "complete-sets": "Complete Sets",
  serums: "Saddles",
  creams: "Bridles",
  cleansers: "Reins",
  body: "Leather Care",
  "body-care": "Leather Care",
};

export function getCategoryPath(category: string): string {
  const slug = toFrontendCategory(category);
  return `/collections/${slug}`;
}

export const PRODUCT_SPECIFICATION_FIELDS = [
  { key: "composition", label: "Materials" },
  { key: "care", label: "Care" },
  { key: "includes", label: "Size" },
] as const;

export const PRODUCT_VOLUME_OPTIONS = ["Cob", "Full", "Extra Full", "Pony", "Custom"] as const;

export const DEFAULT_RETURN_POLICY = `Unused items may be exchanged within 14 days of delivery.
Ships to North America. Free shipping may apply above the published order threshold.
Payment is cash on delivery.`;
