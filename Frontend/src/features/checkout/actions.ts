"use server";

import { redirect } from "next/navigation";

import { orderService } from "@/lib/api/orders";
import { writeCart } from "@/lib/cart-cookie";
import { parseSchema } from "@/lib/parse-schema";
import { checkoutSchema } from "@/schemas/order";

export async function checkoutAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const items = JSON.parse(String(formData.get("items") ?? "[]")) as unknown;
    const parsed = parseSchema(checkoutSchema, {
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      paymentMethod: String(formData.get("paymentMethod") ?? "cod"),
      items,
      promoCode: String(formData.get("promoCode") ?? "").trim() || undefined,
    });
    const order = await orderService.checkout(parsed);
    await writeCart({ items: [] });
    redirect(`/order-confirmation/${String(order.orderNumber)}`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Checkout failed" };
  }
}
