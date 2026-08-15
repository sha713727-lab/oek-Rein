import { redirect } from "next/navigation";

import { getFreeShippingNote } from "@/constants/commerce";
import { CheckoutForm } from "@/features/checkout/checkout-form";
import { readCart } from "@/lib/cart-cookie";
import { getSessionUser } from "@/lib/session";
import { orderService } from "@/server/services/orders/order.service";
import { productService } from "@/server/services/products/product.service";

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

  return (
    <div className="checkout-page">
      <div className="mx-auto max-w-[1600px] px-6 md:px-20">
        <header className="section-intro checkout-intro">
          <span className="section-intro-eyebrow">Checkout</span>
          <h1 className="section-intro-title">Complete Your Order</h1>
          <p className="section-intro-description">Enter your details to finalize your Zermae order.</p>
        </header>
        <div className="checkout-layout">
          <CheckoutForm itemsJson={JSON.stringify(cart.items)} defaultName={user?.name} defaultEmail={user?.email} />
          <aside className="checkout-summary">
            <p className="checkout-summary-title">Order Summary</p>
            <ul className="space-y-3">
              {lines.map((line, index) => (
                <li key={`${line.title}-${index}`} className="flex justify-between text-sm">
                  <span>
                    {line.title} × {line.quantity}
                  </span>
                  <span>PKR {line.lineTotal.toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-lg">Subtotal PKR {subtotal.toLocaleString()}</p>
            <p className="checkout-note mt-4">{getFreeShippingNote(commerce)}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
