import { redirect } from "next/navigation";

import { ADMIN_ROLES } from "@/constants/roles";
import { getSessionUser } from "@/lib/session";
import { productService } from "@/server/services/products/product.service";

export default async function AdminInventoryPage() {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  const result = await productService.list({ limit: 50, status: "published" });
  return (
    <>
      <h1 className="mb-8 text-3xl tracking-[0.18em] uppercase">Inventory</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-border">
            <th className="py-2">SKU</th>
            <th>Title</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {result.products.map((product) => (
            <tr key={String(product.id)} className="border-b border-brand-border">
              <td className="py-3">{String(product.sku)}</td>
              <td>{String(product.title)}</td>
              <td>{String(product.stock)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
