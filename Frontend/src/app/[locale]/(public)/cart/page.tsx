import Image from "next/image";
import Link from "next/link";

import { IconHeart, IconMinus, IconPlus } from "@/components/icons/icons";
import { CATEGORY_LABELS } from "@/constants/catalog";
import { removeFromCartAction, updateCartQuantityAction } from "@/features/cart/actions";
import { toggleWishlistAction } from "@/features/wishlist/actions";
import { readCart } from "@/lib/cart-cookie";
import { productService } from "@/server/services/products/product.service";

export default async function CartPage() {
  const cart = await readCart();
  const products = await productService.getByIds(cart.items.map((item) => item.productId));
  const map = new Map(products.map((product) => [product.id, product]));
  const lines = cart.items.map((item) => {
    const product = map.get(item.productId);
    const price = Number(product?.effectivePrice ?? product?.price ?? 0);
    return { ...item, product, lineTotal: price * item.quantity };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const empty = lines.length === 0;

  return (
    <div className={`cart-page${empty ? " cart-page--empty" : ""}`}>
      <div className="mx-auto max-w-[1600px] px-6 md:px-20">
        {empty ? (
          <div className="cart-empty">
            <span className="section-intro-eyebrow">Shopping Bag</span>
            <h1 className="cart-empty-title">Your Bag Is Empty</h1>
            <p className="cart-empty-description">
              Discover Zermae serums, creams, cleansers and body care, then add your favorites to begin checkout.
            </p>
            <div className="cart-empty-actions">
              <Link href="/collections/all" className="luxury-button-solid">
                Continue Shopping
              </Link>
              <Link href="/collections/new" className="luxury-button-outline">
                Explore New Arrivals
              </Link>
            </div>
          </div>
        ) : (
          <>
            <header className="section-intro cart-page-intro">
              <span className="section-intro-eyebrow">Shopping Bag</span>
              <h1 className="section-intro-title">Your Selected Care</h1>
              <p className="section-intro-description">Review your ritual before checkout.</p>
            </header>
            <div className="cart-layout">
              <div className="cart-items-list">
                {lines.map((line) => {
                  const title = String(line.product?.title ?? "Product");
                  const image = ((line.product?.images as Array<{ url: string }> | undefined) ?? [])[0]?.url;
                  const category = String(line.product?.category ?? "all");
                  return (
                    <article key={`${line.productId}-${line.size ?? ""}-${line.color ?? ""}`} className="cart-item-card">
                      <Link href={`/product/${line.productId}`} className="cart-item-media">
                        {image ? (
                          <Image src={image} alt={title} fill className="cart-item-image object-cover" sizes="160px" />
                        ) : null}
                      </Link>
                      <div className="cart-item-body">
                        <div className="cart-item-top">
                          <div className="cart-item-details">
                            <span className="cart-item-category">{(CATEGORY_LABELS[category] ?? "Collection").toUpperCase()}</span>
                            <Link href={`/product/${line.productId}`} className="cart-item-name">
                              {title}
                            </Link>
                            <div className="cart-item-meta">
                              {line.color ? <span className="cart-item-color">{line.color}</span> : null}
                              {line.size ? <span className="cart-item-size">Size: {line.size}</span> : null}
                            </div>
                          </div>
                          <div className="cart-item-side">
                            <div className="cart-item-qty" aria-label="Quantity">
                              <form action={updateCartQuantityAction}>
                                <input type="hidden" name="productId" value={line.productId} />
                                {line.size ? <input type="hidden" name="size" value={line.size} /> : null}
                                {line.color ? <input type="hidden" name="color" value={line.color} /> : null}
                                <input type="hidden" name="quantity" value={line.quantity - 1} />
                                <button type="submit" className="cart-item-qty-btn" aria-label="Decrease quantity">
                                  <IconMinus />
                                </button>
                              </form>
                              <span className="cart-item-qty-value">{line.quantity}</span>
                              <form action={updateCartQuantityAction}>
                                <input type="hidden" name="productId" value={line.productId} />
                                {line.size ? <input type="hidden" name="size" value={line.size} /> : null}
                                {line.color ? <input type="hidden" name="color" value={line.color} /> : null}
                                <input type="hidden" name="quantity" value={line.quantity + 1} />
                                <button type="submit" className="cart-item-qty-btn" aria-label="Increase quantity">
                                  <IconPlus />
                                </button>
                              </form>
                            </div>
                            <p className="cart-item-price">PKR {line.lineTotal.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <form action={toggleWishlistAction}>
                            <input type="hidden" name="productId" value={line.productId} />
                            <button type="submit" className="cart-item-link">
                              <IconHeart /> Move to wishlist
                            </button>
                          </form>
                          <form action={removeFromCartAction}>
                            <input type="hidden" name="productId" value={line.productId} />
                            {line.size ? <input type="hidden" name="size" value={line.size} /> : null}
                            {line.color ? <input type="hidden" name="color" value={line.color} /> : null}
                            <button type="submit" className="cart-item-link">
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <aside className="cart-summary">
                <p className="cart-summary-label">Subtotal</p>
                <p className="cart-summary-total">PKR {subtotal.toLocaleString()}</p>
                <Link href="/checkout" className="luxury-button-solid">
                  Checkout
                </Link>
                <Link href="/collections/all" className="luxury-button-outline">
                  Continue Shopping
                </Link>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
