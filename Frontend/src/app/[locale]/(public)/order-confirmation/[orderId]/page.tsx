import Link from "next/link";
import { notFound } from "next/navigation";

import { IconShield, IconTruck } from "@/components/icons/icons";
import { formatSupportPhoneDisplay, supportWhatsAppUrlFromPhone } from "@/constants/site";
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
  const supportDisplay = formatSupportPhoneDisplay(storefront.content.supportPhone);
  const whatsappHref = supportWhatsAppUrlFromPhone(
    storefront.content.supportPhone,
    `Assalam o Alaikum Zermae, I just placed order ${order.orderNumber}. Please confirm.`,
  );
  return (
    <div className="order-confirmation-page">
      <div className="mx-auto max-w-[42rem] px-6 md:px-20">
        <header className="order-confirmation-hero">
          <span className="order-confirmation-eyebrow">Order Confirmed</span>
          <h1 className="order-confirmation-title">Thank You For Your Order</h1>
          <p className="order-confirmation-lead">
            We have your order for <span className="order-confirmation-email">{order.email}</span>
            {order.phone ? (
              <>
                {" "}
                and will reach you on <span className="order-confirmation-email">{order.phone}</span>
              </>
            ) : null}
            . Pay the courier in cash when it arrives.
          </p>
          <p className="order-confirmation-lead">
            A confirmation is sent to your WhatsApp and email when messaging is enabled. Need help? WhatsApp us on{" "}
            <a href={whatsappHref} className="order-confirmation-email" target="_blank" rel="noreferrer">
              {supportDisplay}
            </a>
            .
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
          <a href={whatsappHref} className="luxury-button-solid" target="_blank" rel="noreferrer">
            WhatsApp Zermae
          </a>
          <Link href="/collections/all" className="luxury-button-outline">
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
