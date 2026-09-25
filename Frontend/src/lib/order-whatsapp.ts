import { brandName } from "@/constants/brand";
import { DEFAULT_COMMERCE_SETTINGS } from "@/constants/commerce";
import {
  formatSupportPhoneDisplay,
  supportPhoneE164,
  toWhatsAppDigits,
} from "@/constants/site";
import { formatMoney } from "@/constants/storefront";

type OrderWhatsAppInput = {
  orderNumber: string;
  customer: string;
  phone: string;
  items: readonly { name: string; quantity: number }[];
  total: number;
  currency?: string;
  supportPhone?: string;
};

export function customerOrderWhatsAppMessage(order: OrderWhatsAppInput): string {
  const lines = order.items.map((item) => `• ${item.name} × ${item.quantity}`).join("\n");
  const money = formatMoney(order.total, order.currency ?? DEFAULT_COMMERCE_SETTINGS.currency);
  const display = formatSupportPhoneDisplay(order.supportPhone);
  const e164 = supportPhoneE164(order.supportPhone);
  return [
    `Assalam o Alaikum ${order.customer},`,
    ``,
    `Thank you for shopping with ${brandName}.`,
    `Your order ${order.orderNumber} is confirmed.`,
    ``,
    lines,
    ``,
    `Total: ${money}`,
    `Payment: Cash on delivery`,
    `Delivery: Ships to North America`,
    ``,
    `Questions? WhatsApp us on ${display} (${e164}).`,
    ``,
    `— ${brandName}`,
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
