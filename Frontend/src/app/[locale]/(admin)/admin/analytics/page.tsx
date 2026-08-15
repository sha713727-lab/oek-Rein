import { redirect } from "next/navigation";

import { ADMIN_ROLES } from "@/constants/roles";
import { getSessionUser } from "@/lib/session";
import { orderService } from "@/server/services/orders/order.service";

export default async function AdminAnalyticsPage() {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  const orders = await orderService.listAdmin(1, 100);
  const revenue = orders.orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  return (
    <>
      <h1 className="mb-8 text-3xl tracking-[0.18em] uppercase">Analytics</h1>
      <p>Orders in view: {orders.pagination.total}</p>
      <p>Revenue in view: PKR {revenue.toLocaleString()}</p>
    </>
  );
}
