"use server";

import { redirect } from "next/navigation";

import { writeCart } from "@/lib/cart-cookie";
import { sha256Hex } from "@/lib/crypto";
import { parseSchema } from "@/lib/parse-schema";
import { getSessionUser } from "@/lib/session";
import { checkoutSchema } from "@/schemas/order";
import { orderService } from "@/server/services/orders/order.service";

export async function checkoutAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const user = await getSessionUser();
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
    });
    const order = await orderService.checkout(parsed, user?.id ?? null, sha256Hex(JSON.stringify(parsed)));
    await writeCart({ items: [] });
    redirect(`/order-confirmation/${String(order.orderNumber)}`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Checkout failed" };
  }
}
