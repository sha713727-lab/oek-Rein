import { revalidatePath } from "next/cache";

export function revalidateStorefront(): void {
  revalidatePath("/", "layout");
  revalidatePath("/admin/customer-side");
  revalidatePath("/admin/promos");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/shipping");
  revalidatePath("/returns");
}
