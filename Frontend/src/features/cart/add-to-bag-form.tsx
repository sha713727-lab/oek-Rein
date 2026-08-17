"use client";

import { type ReactNode, useTransition } from "react";

import { addToCartAction } from "@/features/cart/actions";
import { notifyBagOpened, notifyToast } from "@/lib/bag-events";

export function AddToBagForm({
  productId,
  quantity = 1,
  size,
  color,
  colorHex,
  className,
  disabled,
  children,
}: {
  productId: string;
  quantity?: number;
  size?: string;
  color?: string;
  colorHex?: string | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      action={(formData) => {
        startTransition(async () => {
          const result = await addToCartAction(formData);
          if (result.error) {
            notifyToast(result.error, "error");
            return;
          }
          notifyToast("Added to bag");
          notifyBagOpened();
        });
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity} />
      {size ? <input type="hidden" name="size" value={size} /> : null}
      {color ? <input type="hidden" name="color" value={color} /> : null}
      {colorHex ? <input type="hidden" name="colorHex" value={colorHex} /> : null}
      <fieldset disabled={disabled || pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
