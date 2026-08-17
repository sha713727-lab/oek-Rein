import Link from "next/link";
import { notFound } from "next/navigation";

import { IconShield, IconTruck } from "@/components/icons/icons";
import { OrderSummary } from "@/features/orders/order-summary";
import { orderService } from "@/lib/api/orders";
import { getSessionUser } from "@/lib/session";
import { getStorefront } from "@/lib/storefront";
import type { OrderRecord } from "@/types/order";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await getSessionUser();
  let order: OrderRecord;
  try {
    order = await orderService.getByOrderNumber(orderId, user);
  } catch {
    notFound();
  }

  const storefront = await getStorefront();
  return (
    <div className="order-confirmation-page">
      <div className="mx-auto max-w-[42rem] px-6 md:px-20">
        <header className="order-confirmation-hero">
          <span className="order-confirmation-eyebrow">Order Confirmed</span>
          <h1 className="order-confirmation-title">Thank You For Your Order</h1>
          <p className="order-confirmation-lead">
            We have your order for <span className="order-confirmation-email">{order.email}</span>. Pay the courier in
            cash when it arrives.
          </p>
        </header>
        <div className="order-confirmation-card">
          <p className="order-confirmation-fallback-label">Order Reference</p>
          <p className="order-confirmation-fallback-id">{order.orderNumber}</p>
          <OrderSummary order={order} currency={storefront.commerce.currency} />
        </div>
        <div className="order-confirmation-assurance">
          <div className="order-confirmation-assurance-item">
            <IconTruck />
            <span>Nationwide delivery within 3–5 working days</span>
          </div>
          <div className="order-confirmation-assurance-item">
            <IconShield />
            <span>Cash on delivery</span>
          </div>
        </div>
        <div className="order-confirmation-actions no-print">
          <Link href="/collections/all" className="luxury-button-solid">
            Continue Shopping
          </Link>
          <Link href="/orders/lookup" className="luxury-button-outline">
            Track later
          </Link>
        </div>
      </div>
    </div>
  );
}
