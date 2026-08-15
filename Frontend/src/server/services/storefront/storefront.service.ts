import { type CommerceSettings, resolveCommerceSettings } from "@/constants/commerce";
import { AppError } from "@/lib/app-error";
import { storefrontRepository } from "@/server/database/repositories/storefront/storefront.repository";

export class StorefrontService {
  async getPublished(): Promise<CommerceSettings> {
    const row = await storefrontRepository.findDefault();
    if (!row) {
      throw AppError.notFound("Storefront settings not found");
    }
    return resolveCommerceSettings({
      currency: row.currency,
      standardShippingFee: Number(row.standard_shipping_fee),
      freeShippingThreshold: Number(row.free_shipping_threshold),
      freeShippingEnabled: row.free_shipping_enabled,
      taxEnabled: row.tax_enabled,
      taxRate: Number(row.tax_rate),
      taxLabel: row.tax_label,
    });
  }

  async updatePublished(settings: CommerceSettings): Promise<void> {
    await storefrontRepository.upsertDefault(settings);
  }
}

export const storefrontService = new StorefrontService();
