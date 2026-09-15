"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useState, useTransition } from "react";

import { IconClose, IconTrash } from "@/components/icons/icons";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { formatMoney } from "@/constants/storefront";
import { getMiniCartAction, type MiniCartSnapshot, removeFromCartAction } from "@/features/cart/actions";
import { OrderTotals } from "@/features/checkout/order-totals";
import { BAG_EVENT } from "@/lib/bag-events";
import { resolvePublicAssetSrc } from "@/lib/public-assets";

const EMPTY: MiniCartSnapshot = {
  lines: [],
  count: 0,
  subtotal: 0,
  shippingFee: 0,
  taxAmount: 0,
  taxLabel: "GST",
  total: 0,
  freeShippingNote: "",
  currency: "PKR",
};

export function MiniCart({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const [cart, setCart] = useState<MiniCartSnapshot>(EMPTY);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const next = await getMiniCartAction();
      setCart(next);
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    refresh();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, refresh]);

  useEffect(() => {
    const onBag = () => {
      refresh();
    };
    window.addEventListener(BAG_EVENT, onBag);
    return () => window.removeEventListener(BAG_EVENT, onBag);
  }, [refresh]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="mini-cart">
      <button type="button" className="mini-cart-backdrop" aria-label="Close bag" onClick={onClose} />
      <aside className="mini-cart-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="mini-cart-head">
          <h2 id={titleId} className="mini-cart-title">
            Your Bag
          </h2>
          <button type="button" className="mini-cart-close" aria-label="Close bag" onClick={onClose}>
            <IconClose />
          </button>
        </header>
        {cart.lines.length === 0 ? (
          <p className="mini-cart-empty">{pending ? "Updating..." : "Your bag is empty."}</p>
        ) : (
          <ul className="mini-cart-lines">
            {cart.lines.map((line) => (
              <li key={`${line.productId}-${line.size ?? ""}-${line.color ?? ""}`} className="mini-cart-line">
                <Link href={`/product/${line.productId}`} className="mini-cart-media" onClick={onClose}>
                  {line.image ? (
                    <Image src={resolvePublicAssetSrc(line.image)} alt="" width={72} height={72} className="mini-cart-image" />
                  ) : (
                    <span className="mini-cart-fallback" aria-hidden="true" />
                  )}
                </Link>
                <div className="mini-cart-copy">
                  <Link href={`/product/${line.productId}`} className="mini-cart-name" onClick={onClose}>
                    {line.title}
                  </Link>
                  <p className="mini-cart-meta">
                    Qty {line.quantity}
                    {line.size ? ` · ${line.size}` : ""}
                  </p>
                  <p className="mini-cart-price">{formatMoney(line.lineTotal, cart.currency)}</p>
                  <form
                    action={async (formData) => {
                      await removeFromCartAction(formData);
                      refresh();
                    }}
                  >
                    <input type="hidden" name="productId" value={line.productId} />
                    {line.size ? <input type="hidden" name="size" value={line.size} /> : null}
                    {line.color ? <input type="hidden" name="color" value={line.color} /> : null}
                    <ConfirmSubmit
                      className="mini-cart-remove"
                      message="Remove this item from your bag?"
                      label={
                        <>
                          <IconTrash />
                          <span>Remove</span>
                        </>
                      }
                    />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        {cart.lines.length > 0 ? (
          <div className="mini-cart-foot">
            <OrderTotals
              subtotal={cart.subtotal}
              shippingFee={cart.shippingFee}
              taxAmount={cart.taxAmount}
              taxLabel={cart.taxLabel}
              total={cart.total}
              currency={cart.currency}
            />
            <p className="mini-cart-note">{cart.freeShippingNote}</p>
            <p className="mini-cart-cod">Cash on delivery. Pay the courier when your order arrives.</p>
            <Link href="/checkout" className="luxury-button-solid mini-cart-cta" onClick={onClose}>
              Checkout
            </Link>
            <Link href="/cart" className="luxury-button-outline mini-cart-cta" onClick={onClose}>
              View bag
            </Link>
          </div>
        ) : (
          <Link href="/collections/all" className="luxury-button-solid mini-cart-cta" onClick={onClose}>
            Continue shopping
          </Link>
        )}
      </aside>
    </div>
  );
}
