export const PRODUCT_CATEGORIES = [
  "new-arrivals",
  "serums",
  "creams",
  "cleansers",
  "body-care",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const DISCOUNT_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
} as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES];

export const FRONTEND_TO_BACKEND_CATEGORY: Record<string, ProductCategory | null> = {
  new: "new-arrivals",
  serums: "serums",
  creams: "creams",
  cleansers: "cleansers",
  body: "body-care",
  all: null,
};

export const BACKEND_TO_FRONTEND_CATEGORY: Record<string, string> = {
  "new-arrivals": "new",
  serums: "serums",
  creams: "creams",
  cleansers: "cleansers",
  "body-care": "body",
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
  serums: "Serums",
  creams: "Creams",
  cleansers: "Cleansers",
  body: "Body Care",
  "new-arrivals": "New Arrivals",
  "body-care": "Body Care",
};

export function getCategoryPath(category: string): string {
  const slug = toFrontendCategory(category);
  return `/collections/${slug}`;
}

export const PRODUCT_SPECIFICATION_FIELDS = [
  { key: "composition", label: "Ingredients" },
  { key: "care", label: "How to use" },
  { key: "includes", label: "Size" },
] as const;

export const PRODUCT_VOLUME_OPTIONS = ["15 ml", "30 ml", "50 ml", "100 ml", "200 ml"] as const;

export const DEFAULT_RETURN_POLICY = `Unopened products may be exchanged within 14 days of delivery.
Nationwide delivery within 3–5 working days. Free shipping may apply above the published order threshold.
Payment is cash on delivery.`;
