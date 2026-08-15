"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readCart, writeCart } from "@/lib/cart-cookie";
import { parseSchema } from "@/lib/parse-schema";
import { cartItemSchema } from "@/schemas/order";

export async function addToCartAction(formData: FormData): Promise<void> {
  const item = parseSchema(cartItemSchema, {
    productId: String(formData.get("productId") ?? ""),
    quantity: Number(formData.get("quantity") ?? 1),
    size: formData.get("size") ? String(formData.get("size")) : null,
    color: formData.get("color") ? String(formData.get("color")) : null,
  });
  const cart = await readCart();
  const existing = cart.items.find(
    (entry) => entry.productId === item.productId && entry.size === item.size && entry.color === item.color,
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.items.push(item);
  }
  await writeCart(cart);
  revalidatePath("/", "layout");
}

function lineKey(formData: FormData) {
  return {
    productId: String(formData.get("productId") ?? ""),
    size: formData.get("size") ? String(formData.get("size")) : null,
    color: formData.get("color") ? String(formData.get("color")) : null,
  };
}

function sameLine(
  item: { productId: string; size?: string | null | undefined; color?: string | null | undefined },
  key: { productId: string; size: string | null; color: string | null },
): boolean {
  return item.productId === key.productId && (item.size ?? null) === key.size && (item.color ?? null) === key.color;
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  const key = lineKey(formData);
  const cart = await readCart();
  await writeCart({
    items: cart.items.filter((item) => !sameLine(item, key)),
  });
  revalidatePath("/", "layout");
}

export async function updateCartQuantityAction(formData: FormData): Promise<void> {
  const quantity = Number(formData.get("quantity") ?? 0);
  if (quantity < 1) {
    await removeFromCartAction(formData);
    return;
  }
  const key = lineKey(formData);
  const cart = await readCart();
  const existing = cart.items.find((item) => sameLine(item, key));
  if (!existing) {
    return;
  }
  existing.quantity = Math.min(20, quantity);
  await writeCart(cart);
  revalidatePath("/", "layout");
}

export async function buyNowAction(formData: FormData): Promise<void> {
  await addToCartAction(formData);
  redirect("/checkout");
}
