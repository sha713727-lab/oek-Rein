import { revalidatePath } from "next/cache";

export function revalidateStorefront(productId?: string): void {
  revalidatePath("/", "layout");
  revalidatePath("/collections", "layout");
  revalidatePath("/wishlist");
  revalidatePath("/admin/customer-side");
  revalidatePath("/admin/promos");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account/orders");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/shipping");
  revalidatePath("/returns");
  if (productId) {
    revalidatePath(`/product/${productId}`);
  }
}
