import { redirect } from "next/navigation";

import { ADMIN_ROLES } from "@/constants/roles";
import { StorefrontEditor } from "@/features/admin/storefront-editor";
import { productService } from "@/lib/api/products";
import { getSessionUser } from "@/lib/session";
import { getStorefront } from "@/lib/storefront";

export default async function AdminCustomerSidePage() {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  const [storefront, catalog] = await Promise.all([
    getStorefront(),
    productService.list({ limit: 48, status: "published" }),
  ]);
  return (
    <StorefrontEditor
      storefront={storefront}
      catalog={catalog.products.map((item) => ({ sku: item.sku, title: item.title }))}
    />
  );
}
