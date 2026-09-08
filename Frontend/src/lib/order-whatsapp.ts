import { SUPPORT_PHONE, SUPPORT_PHONE_E164, toWhatsAppDigits } from "@/constants/site";
import { formatMoney } from "@/constants/storefront";

type OrderWhatsAppInput = {
  orderNumber: string;
  customer: string;
  phone: string;
  items: readonly { name: string; quantity: number }[];
  total: number;
  currency?: string;
};

export function customerOrderWhatsAppMessage(order: OrderWhatsAppInput): string {
  const lines = order.items.map((item) => `• ${item.name} × ${item.quantity}`).join("\n");
  const money = formatMoney(order.total, order.currency ?? "PKR");
  return [
    `Assalam o Alaikum ${order.customer},`,
    ``,
    `Thank you for shopping with Zermae.`,
    `Your order ${order.orderNumber} is confirmed.`,
    ``,
    lines,
    ``,
    `Total: ${money}`,
    `Payment: Cash on delivery`,
    `Delivery: 3–5 working days`,
    ``,
    `Questions? WhatsApp us on ${SUPPORT_PHONE} (${SUPPORT_PHONE_E164}).`,
    ``,
    `— Zermae`,
  ].join("\n");
}

/** Opens YOUR WhatsApp with this message ready to send to the customer (one tap). */
export function customerWhatsAppSendUrl(order: OrderWhatsAppInput): string | null {
  const digits = toWhatsAppDigits(order.phone);
  if (!digits) {
    return null;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(customerOrderWhatsAppMessage(order))}`;
}
