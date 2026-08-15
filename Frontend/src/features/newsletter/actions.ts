"use server";

import { parseSchema } from "@/lib/parse-schema";
import { newsletterSchema } from "@/schemas/auth";
import { newsletterService } from "@/server/services/newsletter/newsletter.service";

export async function subscribeNewsletterAction(formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  try {
    const parsed = parseSchema(newsletterSchema, { email: String(formData.get("email") ?? "") });
    await newsletterService.subscribe(parsed.email);
    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to subscribe" };
  }
}
