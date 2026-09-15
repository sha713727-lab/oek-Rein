"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { PRODUCT_STATUS } from "@/constants/catalog";
import { calculateOrderTotals, getFreeShippingNote } from "@/constants/commerce";
import { orderService } from "@/lib/api/orders";
import { productService } from "@/lib/api/products";
import { readCart, writeCart } from "@/lib/cart-cookie";
import { parseSchema } from "@/lib/parse-schema";
import { cartItemSchema } from "@/schemas/order";

export type CartActionResult = { ok?: boolean; error?: string };

export type MiniCartLine = {
  productId: string;
  title: string;
  image: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
  lineTotal: number;
};

export type MiniCartSnapshot = {
  lines: MiniCartLine[];
  count: number;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  taxLabel: string;
  total: number;
  freeShippingNote: string;
  currency: string;
};

async function applyCartItem(formData: FormData): Promise<CartActionResult> {
  const item = parseSchema(cartItemSchema, {
    productId: String(formData.get("productId") ?? ""),
    quantity: Number(formData.get("quantity") ?? 1),
    size: formData.get("size") ? String(formData.get("size")) : null,
    color: formData.get("color") ? String(formData.get("color")) : null,
    colorHex: formData.get("colorHex") ? String(formData.get("colorHex")) : null,
  });
  const products = await productService.getByIds([item.productId]);
  const product = products[0];
  if (!product || product.status !== PRODUCT_STATUS.PUBLISHED) {
    return { error: "This product is no longer available." };
  }
  const cart = await readCart();
  const existing = cart.items.find(
    (entry) => entry.productId === item.productId && entry.size === item.size && entry.color === item.color,
  );
  const nextQuantity = (existing?.quantity ?? 0) + item.quantity;
  if (product.stock < 1) {
    return { error: "This product is out of stock." };
  }
  if (nextQuantity > product.stock) {
    return { error: `Only ${product.stock} left.` };
  }
  if (existing) {
    existing.quantity = nextQuantity;
  } else {
    cart.items.push({ ...item, quantity: nextQuantity });
  }
  await writeCart(cart);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addToCartAction(formData: FormData): Promise<CartActionResult> {
  try {
    return await applyCartItem(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to add to bag" };
  }
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
  const products = await productService.getByIds([existing.productId]);
  const stock = products[0]?.stock ?? 0;
  existing.quantity = Math.min(20, quantity, Math.max(1, stock));
  await writeCart(cart);
  revalidatePath("/", "layout");
}

export async function buyNowAction(formData: FormData): Promise<CartActionResult> {
  const result = await addToCartAction(formData);
  if (result.error) {
    return result;
  }
  redirect("/checkout");
}

export async function getMiniCartAction(): Promise<MiniCartSnapshot> {
  const [cart, commerce] = await Promise.all([readCart(), orderService.getCommerceSettings()]);
  const products = await productService.getByIds(cart.items.map((item) => item.productId));
  const map = new Map(products.map((product) => [product.id, product]));
  const lines = cart.items
    .map((item) => {
      const product = map.get(item.productId);
      if (!product) {
        return null;
      }
      const price = Number(product.effectivePrice ?? product.price ?? 0);
      return {
        productId: item.productId,
        title: String(product.title),
        image: product.images[0]?.url ?? null,
        quantity: item.quantity,
        size: item.size ?? null,
        color: item.color ?? null,
        lineTotal: price * item.quantity,
      };
    })
    .filter((line): line is MiniCartLine => line !== null);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const totals = calculateOrderTotals(subtotal, commerce);
  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    ...totals,
    freeShippingNote: getFreeShippingNote(commerce),
    currency: commerce.currency,
  };
}
