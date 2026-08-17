export const DEFAULT_COMMERCE_SETTINGS = {
  currency: "PKR",
  standardShippingFee: 500,
  freeShippingThreshold: 15000,
  freeShippingEnabled: true,
  taxEnabled: true,
  taxRate: 17,
  taxLabel: "GST",
} as const;

export type CommerceSettings = {
  readonly currency: string;
  readonly standardShippingFee: number;
  readonly freeShippingThreshold: number;
  readonly freeShippingEnabled: boolean;
  readonly taxEnabled: boolean;
  readonly taxRate: number;
  readonly taxLabel: string;
};

export function resolveCommerceSettings(settings: Partial<CommerceSettings> = {}): CommerceSettings {
  return {
    currency: settings.currency ?? DEFAULT_COMMERCE_SETTINGS.currency,
    standardShippingFee: Number(
      settings.standardShippingFee ?? DEFAULT_COMMERCE_SETTINGS.standardShippingFee,
    ),
    freeShippingThreshold: Number(
      settings.freeShippingThreshold ?? DEFAULT_COMMERCE_SETTINGS.freeShippingThreshold,
    ),
    freeShippingEnabled:
      settings.freeShippingEnabled ?? DEFAULT_COMMERCE_SETTINGS.freeShippingEnabled,
    taxEnabled: settings.taxEnabled ?? DEFAULT_COMMERCE_SETTINGS.taxEnabled,
    taxRate: Number(settings.taxRate ?? DEFAULT_COMMERCE_SETTINGS.taxRate),
    taxLabel: (settings.taxLabel ?? DEFAULT_COMMERCE_SETTINGS.taxLabel).trim(),
  };
}

export function calculateShippingFee(
  subtotal: number,
  settings: CommerceSettings = DEFAULT_COMMERCE_SETTINGS,
): number {
  const commerce = resolveCommerceSettings(settings);
  if (
    commerce.freeShippingEnabled &&
    commerce.freeShippingThreshold > 0 &&
    subtotal >= commerce.freeShippingThreshold
  ) {
    return 0;
  }
  return Math.max(0, commerce.standardShippingFee);
}

export function getFreeShippingNote(settings: CommerceSettings = DEFAULT_COMMERCE_SETTINGS): string {
  const commerce = resolveCommerceSettings(settings);
  if (!commerce.freeShippingEnabled) {
    return "Standard shipping applies to all orders.";
  }
  return `Free shipping on orders above ${commerce.currency} ${commerce.freeShippingThreshold.toLocaleString()}.`;
}

export function applyDiscount(subtotal: number, discount: number): number {
  return Math.max(0, subtotal - Math.max(0, discount));
}

export function calculateTaxAmount(
  subtotal: number,
  settings: CommerceSettings = DEFAULT_COMMERCE_SETTINGS,
): number {
  const commerce = resolveCommerceSettings(settings);
  if (!commerce.taxEnabled || commerce.taxRate <= 0) {
    return 0;
  }
  return Math.round((subtotal * commerce.taxRate) / 100);
}

export function calculateOrderTotals(
  subtotal: number,
  settings: CommerceSettings = DEFAULT_COMMERCE_SETTINGS,
  discount = 0,
): {
  subtotal: number;
  discount: number;
  shippingFee: number;
  taxAmount: number;
  taxLabel: string;
  total: number;
} {
  const commerce = resolveCommerceSettings(settings);
  const discounted = applyDiscount(subtotal, discount);
  const shippingFee = calculateShippingFee(discounted, commerce);
  const taxAmount = calculateTaxAmount(discounted, commerce);
  return {
    subtotal,
    discount: Math.max(0, Math.min(subtotal, discount)),
    shippingFee,
    taxAmount,
    taxLabel: commerce.taxLabel,
    total: discounted + shippingFee + taxAmount,
  };
}
