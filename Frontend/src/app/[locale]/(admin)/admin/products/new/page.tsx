import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_ROLES } from "@/constants/roles";
import { getSessionUser } from "@/lib/session";
import { productService } from "@/server/services/products/product.service";

async function createProductAction(formData: FormData): Promise<void> {
  "use server";
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  await productService.create({
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? "new-arrivals"),
    price: Number(formData.get("price") ?? 0),
    stock: Number(formData.get("stock") ?? 0),
    status: "published",
  });
  redirect("/admin/inventory");
}

export default async function AdminNewProductPage() {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  return (
    <>
      <h1 className="mb-8 text-3xl tracking-[0.18em] uppercase">New product</h1>
      <form action={createProductAction} className="max-w-xl space-y-4">
        <Input label="Title" name="title" required />
        <label className="flex flex-col gap-2 text-[11px] tracking-[0.2em] uppercase">
          Category
          <select name="category" className="border border-brand-border px-4 py-3 text-sm">
            <option value="new-arrivals">New arrivals</option>
            <option value="serums">Serums</option>
            <option value="creams">Creams</option>
            <option value="cleansers">Cleansers</option>
            <option value="body-care">Body care</option>
          </select>
        </label>
        <Input label="Price" name="price" type="number" min="0" required />
        <Input label="Stock" name="stock" type="number" min="0" required />
        <Button type="submit">Create</Button>
      </form>
    </>
  );
}
