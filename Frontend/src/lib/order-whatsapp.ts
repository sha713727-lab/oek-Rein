import { brandName } from "@/constants/brand";
import { DEFAULT_COMMERCE_SETTINGS } from "@/constants/commerce";
import { formatSupportContactsLine, SUPPORT_EMAIL, toWhatsAppDigits } from "@/constants/site";
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
  const contacts = formatSupportContactsLine();
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
    `Questions? WhatsApp us on ${contacts} or email ${SUPPORT_EMAIL}.`,
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
