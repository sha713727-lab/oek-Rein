"use server";

import { redirect } from "next/navigation";

import { orderService } from "@/lib/api/orders";
import { writeCart } from "@/lib/cart-cookie";
import { writeOrderReceipt } from "@/lib/order-receipt-cookie";
import { parseSchema } from "@/lib/parse-schema";
import { resolveAndPruneCart } from "@/lib/resolve-cart";
import { checkoutSchema } from "@/schemas/order";

export async function checkoutAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const { items } = await resolveAndPruneCart({ persist: true });
    if (items.length === 0) {
      return { error: "Your bag is empty." };
    }

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
    await writeOrderReceipt(String(order.orderNumber), String(order.email));
    await writeCart({ items: [] });
    redirect(`/order-confirmation/${String(order.orderNumber)}`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Checkout failed" };
  }
}
