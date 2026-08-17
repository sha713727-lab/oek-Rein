"use server";

import { redirect } from "next/navigation";

import { ORDER_STATUS, type OrderStatus } from "@/constants/order-status";
import { ADMIN_ROLES } from "@/constants/roles";
import { productIdFromForm, productPayloadFromForm } from "@/features/admin/parse-product-form";
import { orderService } from "@/lib/api/orders";
import { productService } from "@/lib/api/products";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { saveUpload } from "@/lib/save-upload";
import { getSessionUser } from "@/lib/session";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  return user;
}

async function collectImages(formData: FormData, title: string) {
  const images: Array<{ url: string; alt: string; order: number }> = [];
  for (let index = 0; index < 8; index += 1) {
    const uploaded = await saveUpload(formData.get(`imageFile${index + 1}`) as File | null);
    const url = uploaded || String(formData.get(`imageUrl${index + 1}`) ?? "").trim();
    if (url) {
      images.push({ url, alt: title, order: index });
    }
  }
  return images;
}

export async function saveProductAction(formData: FormData): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const id = productIdFromForm(formData);
    const payload = productPayloadFromForm(formData, await collectImages(formData, String(formData.get("title") ?? "")));
    if (id) {
      await productService.update(id, payload);
    } else {
      await productService.create(payload);
    }
    revalidateStorefront();
    redirect("/admin/inventory");
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Product could not be saved" };
  }
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await productService.remove(String(formData.get("id") ?? ""));
  revalidateStorefront();
  redirect("/admin/inventory");
}

export async function updateStockAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("productId") ?? "");
  await productService.update(id, { stock: Number(formData.get("stock") ?? 0) });
  revalidateStorefront();
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!(Object.values(ORDER_STATUS) as string[]).includes(status)) {
    return;
  }
  await orderService.updateStatus(id, status);
  revalidateStorefront();
}

export async function updateOrderTrackingAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await orderService.updateTracking(
    String(formData.get("orderId") ?? ""),
    String(formData.get("trackingNumber") ?? ""),
    String(formData.get("trackingUrl") ?? ""),
  );
  revalidateStorefront();
}
