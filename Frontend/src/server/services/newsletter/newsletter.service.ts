import { newsletterRepository } from "@/server/database/repositories/newsletter/newsletter.repository";

export class NewsletterService {
  async subscribe(email: string, source = "footer"): Promise<{ subscribed: true }> {
    await newsletterRepository.upsert(email.toLowerCase().trim(), source);
    return { subscribed: true };
  }
}

export const newsletterService = new NewsletterService();
