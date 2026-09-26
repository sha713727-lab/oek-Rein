import { z } from "zod";

import { ORDER_STATUS, PAYMENT_METHODS } from "@/constants/order-status";
import { paginationSchema, uuidSchema } from "@/schemas/common";

function cleanText(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").replace(/[<>]/g, "").trim();
}

function isCheckoutPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) {
    return true;
  }
  if (digits.length === 10 && /^[2-9]/.test(digits)) {
    return true;
  }
  if (digits.startsWith("92") && digits.length === 12 && digits[2] === "3") {
    return true;
  }
  if (digits.startsWith("03") && digits.length === 11) {
    return true;
  }
  return digits.length === 10 && digits.startsWith("3");
}

function isNorthAmericaPostal(value: string): boolean {
  const next = value.toUpperCase().trim();
  return /^\d{5}(-\d{4})?$/.test(next) || /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/.test(next);
}

export const checkoutSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254)
    .pipe(z.email("Enter a valid email address.")),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number.")
    .max(24, "Phone number is too long.")
    .refine(isCheckoutPhone, "Enter a valid US, Canadian, or Pakistani mobile number."),
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120)
    .transform(cleanText)
    .refine((value) => /^[\p{L}][\p{L}\s.'-]{1,119}$/u.test(value), "Use letters only in your name."),
  address: z
    .string()
    .trim()
    .min(8, "Enter a complete street address.")
    .max(300)
    .transform(cleanText)
    .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), "Include a street name and number."),
  city: z
    .string()
    .trim()
    .min(2, "Enter your city.")
    .max(80)
    .transform(cleanText)
    .refine((value) => /^[\p{L}][\p{L}\s.'-]{1,79}$/u.test(value), "Enter a valid city name."),
  postalCode: z
    .string()
    .trim()
    .min(3, "Enter a postal or ZIP code.")
    .max(12)
    .transform((value) => value.toUpperCase().replace(/\s+/g, " ").trim())
    .refine(isNorthAmericaPostal, "Enter a valid US ZIP or Canadian postal code."),
  paymentMethod: z.literal(PAYMENT_METHODS.COD),
  items: z
    .array(
      z.object({
        productId: uuidSchema,
        quantity: z.coerce.number().int().min(1),
        size: z.string().trim().nullable().optional(),
        color: z.string().trim().nullable().optional(),
        colorHex: z
          .string()
          .trim()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .nullable()
          .optional(),
      }),
    )
    .min(1),
  notes: z.string().trim().max(500).nullable().optional(),
  promoCode: z
    .string()
    .trim()
    .max(40)
    .regex(/^[A-Za-z0-9_-]*$/, "Promo codes use letters and numbers only.")
    .optional(),
});

export const myOrdersQuerySchema = paginationSchema.extend({
  status: z.enum([...(Object.values(ORDER_STATUS) as [string, ...string[]]), "all"]).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUS) as [string, ...string[]]),
});

export const cartItemSchema = z.object({
  productId: uuidSchema,
  quantity: z.coerce.number().int().min(1).max(20),
  size: z.string().trim().nullable().optional(),
  color: z.string().trim().nullable().optional(),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
});

export const cartStateSchema = z.object({
  items: z.array(cartItemSchema).max(50),
});

export const wishlistStateSchema = z.object({
  ids: z.array(uuidSchema).max(100),
});
