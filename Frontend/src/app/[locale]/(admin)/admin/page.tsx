import Link from "next/link";
import { redirect } from "next/navigation";

import { ADMIN_QUICK_ACTIONS } from "@/constants/admin";
import { ADMIN_ROLES } from "@/constants/roles";
import { getSessionUser } from "@/lib/session";
import { orderService } from "@/server/services/orders/order.service";
import { productService } from "@/server/services/products/product.service";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  const [products, orders] = await Promise.all([
    productService.list({ limit: 8, status: "published" }),
    orderService.listAdmin(1, 8),
  ]);
  return (
    <>
      <section className="admin-welcome-bar">
        <h1 className="admin-welcome-title">Welcome back, {user.name}</h1>
        <p className="text-sm text-text-sub">Zermae operations at a glance</p>
      </section>
      <nav className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_QUICK_ACTIONS.map((action) => (
          <Link key={action.id} href={action.href} className="border border-brand-border bg-brand-white p-5">
            <p className="text-sm tracking-[0.14em] uppercase">{action.title}</p>
            <p className="mt-2 text-sm text-text-sub">{action.description}</p>
          </Link>
        ))}
      </nav>
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg uppercase tracking-[0.12em]">Latest products</h2>
          <ul className="space-y-2 text-sm">
            {products.products.map((product) => (
              <li key={String(product.id)}>{String(product.title)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-lg uppercase tracking-[0.12em]">Latest orders</h2>
          <ul className="space-y-2 text-sm">
            {orders.orders.map((order) => (
              <li key={String(order._id)}>
                {String(order.orderNumber)} · {String(order.status)}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
