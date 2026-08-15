import { z } from "zod";

import { emailSchema, passwordSchema } from "@/schemas/common";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const adminVerifyOtpSchema = z.object({
  challengeId: z.string().min(1),
  otp: z.string().trim().regex(/^\d{6}$/),
});

export const newsletterSchema = z.object({
  email: emailSchema,
});
