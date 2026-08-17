import { z } from "zod";

import { ORDER_STATUS, PAYMENT_METHODS } from "@/constants/order-status";
import { emailSchema, paginationSchema, uuidSchema } from "@/schemas/common";

export const checkoutSchema = z.object({
  email: emailSchema,
  phone: z.string().trim().min(7).max(20),
  fullName: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3).max(20),
  paymentMethod: z.enum(Object.values(PAYMENT_METHODS) as [string, ...string[]]).default("cod"),
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
  promoCode: z.string().trim().max(40).optional(),
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
