import Link from "next/link";
import { notFound } from "next/navigation";

import { IconShield, IconTruck } from "@/components/icons/icons";
import { getSessionUser } from "@/lib/session";
import { orderService } from "@/server/services/orders/order.service";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await getSessionUser();
  let order: Record<string, unknown>;
  try {
    order = (await orderService.getByOrderNumber(orderId, user)) as Record<string, unknown>;
  } catch {
    notFound();
  }
  const shipping = order.shipping as { address?: string; city?: string; postalCode?: string } | undefined;
  const items = (order.items as Array<{ name: string; quantity: number; price: number }> | undefined) ?? [];

  return (
    <div className="order-confirmation-page">
      <div className="mx-auto max-w-[42rem] px-6 md:px-20">
        <header className="order-confirmation-hero">
          <span className="order-confirmation-eyebrow">Order Confirmed</span>
          <h1 className="order-confirmation-title">Thank You For Your Order</h1>
          <p className="order-confirmation-lead">
            A confirmation email has been sent to <span className="order-confirmation-email">{String(order.email)}</span>.
          </p>
        </header>
        <div className="order-confirmation-card">
          <p className="order-confirmation-fallback-label">Order Reference</p>
          <p className="order-confirmation-fallback-id">{String(order.orderNumber)}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {items.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                {item.name} × {item.quantity} — PKR {Number(item.price).toLocaleString()}
              </li>
            ))}
          </ul>
          <p className="mt-6">Total PKR {Number(order.total).toLocaleString()}</p>
          {shipping ? (
            <p className="mt-3 text-sm text-text-sub">
              {shipping.address}, {shipping.city} {shipping.postalCode}
            </p>
          ) : null}
        </div>
        <div className="order-confirmation-assurance">
          <div className="order-confirmation-assurance-item">
            <IconTruck />
            <span>Nationwide delivery within 3–5 working days</span>
          </div>
          <div className="order-confirmation-assurance-item">
            <IconShield />
            <span>Secure checkout and protected transactions</span>
          </div>
        </div>
        <div className="order-confirmation-actions">
          <Link href="/collections/all" className="luxury-button-solid">
            Continue Shopping
          </Link>
          <Link href="/account/orders" className="luxury-button-outline">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
