"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveCommerceSettings } from "@/constants/commerce";
import { ADMIN_ROLES } from "@/constants/roles";
import { getSessionUser } from "@/lib/session";
import { storefrontService } from "@/server/services/storefront/storefront.service";

export async function updateCommerceSettingsAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  await storefrontService.updatePublished(
    resolveCommerceSettings({
      currency: String(formData.get("currency") ?? "PKR"),
      standardShippingFee: Number(formData.get("standardShippingFee") ?? 0),
      freeShippingThreshold: Number(formData.get("freeShippingThreshold") ?? 0),
      freeShippingEnabled: formData.get("freeShippingEnabled") === "on",
      taxEnabled: formData.get("taxEnabled") === "on",
      taxRate: Number(formData.get("taxRate") ?? 0),
      taxLabel: String(formData.get("taxLabel") ?? "GST"),
    }),
  );
  revalidatePath("/admin/customer-side");
}
