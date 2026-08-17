import { redirect } from "next/navigation";

import { calculateOrderTotals, getFreeShippingNote } from "@/constants/commerce";
import { formatMoney } from "@/constants/storefront";
import { CheckoutForm } from "@/features/checkout/checkout-form";
import { OrderTotals } from "@/features/checkout/order-totals";
import { addressService } from "@/lib/api/addresses";
import { orderService } from "@/lib/api/orders";
import { productService } from "@/lib/api/products";
import { readCart } from "@/lib/cart-cookie";
import { getSessionUser } from "@/lib/session";

export default async function CheckoutPage() {
  const cart = await readCart();
  if (cart.items.length === 0) {
    redirect("/cart");
  }
  const [user, products, commerce] = await Promise.all([
    getSessionUser(),
    productService.getByIds(cart.items.map((item) => item.productId)),
    orderService.getCommerceSettings(),
  ]);
  const addresses = user ? await addressService.list(user.id) : [];
  const map = new Map(products.map((product) => [product.id, product]));
  const lines = cart.items.map((item) => {
    const product = map.get(item.productId);
    const price = Number(product?.effectivePrice ?? product?.price ?? 0);
    return {
      title: String(product?.title ?? "Product"),
      quantity: item.quantity,
      lineTotal: price * item.quantity,
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const totals = calculateOrderTotals(subtotal, commerce);

  return (
    <div className="checkout-page">
      <div className="mx-auto max-w-[1600px] px-6 md:px-20">
        <header className="section-intro checkout-intro">
          <span className="section-intro-eyebrow">Checkout</span>
          <h1 className="section-intro-title">Complete Your Order</h1>
          <p className="section-intro-description">Enter your details to finalize your Zermae order.</p>
        </header>
        <div className="checkout-layout">
          <CheckoutForm
            itemsJson={JSON.stringify(cart.items)}
            defaultName={user?.name}
            defaultEmail={user?.email}
            addresses={addresses}
          />
          <aside className="checkout-summary">
            <p className="checkout-summary-title">Order Summary</p>
            <ul className="checkout-summary-items">
              {lines.map((line, index) => (
                <li key={`${line.title}-${index}`} className="checkout-summary-row">
                  <span>
                    {line.title} × {line.quantity}
                  </span>
                  <span>{formatMoney(line.lineTotal, commerce.currency)}</span>
                </li>
              ))}
            </ul>
            <OrderTotals
              subtotal={totals.subtotal}
              shippingFee={totals.shippingFee}
              taxAmount={totals.taxAmount}
              taxLabel={totals.taxLabel}
              total={totals.total}
              currency={commerce.currency}
            />
            <p className="checkout-note">{getFreeShippingNote(commerce)}</p>
            <p className="checkout-note">
              Payment is cash on delivery. Pay the courier in {commerce.currency} when your order arrives. No card is charged online.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
