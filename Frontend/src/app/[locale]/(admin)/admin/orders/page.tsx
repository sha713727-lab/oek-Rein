import { redirect } from "next/navigation";

import { ADMIN_ROLES } from "@/constants/roles";
import { getSessionUser } from "@/lib/session";
import { orderService } from "@/server/services/orders/order.service";

export default async function AdminOrdersPage() {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  const result = await orderService.listAdmin(1, 50);
  return (
    <>
      <h1 className="mb-8 text-3xl tracking-[0.18em] uppercase">Orders</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-border">
            <th className="py-2">Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {result.orders.map((order) => (
            <tr key={String(order._id)} className="border-b border-brand-border">
              <td className="py-3">{String(order.orderNumber)}</td>
              <td>{String(order.customer)}</td>
              <td>{String(order.status)}</td>
              <td>PKR {Number(order.total).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
