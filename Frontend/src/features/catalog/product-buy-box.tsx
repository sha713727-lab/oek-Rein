"use client";

import { useState } from "react";

import { IconHeart, IconMinus, IconPlus, IconShield, IconTruck } from "@/components/icons/icons";
import { Logo } from "@/components/ui/logo";
import { addToCartAction, buyNowAction } from "@/features/cart/actions";
import { toggleWishlistAction } from "@/features/wishlist/actions";

export type ProductBuyModel = {
  id: string;
  title: string;
  sku: string;
  price: number;
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  wished: boolean;
};

export function ProductBuyBox({ product }: { product: ProductBuyModel }) {
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [colorIndex, setColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const color = product.colors[colorIndex];

  return (
    <div className="product-info">
      <div className="product-info-head">
        <Logo theme="dark" size="product" linked={false} className="product-brand" />
        <h1 className="product-title">{product.title}</h1>
        <p className="product-sku">{product.sku}</p>
        <p className="product-price">PKR {product.price.toLocaleString()}</p>
      </div>
      {product.colors.length > 0 ? (
        <div className="product-option">
          <span className="product-option-label">Color</span>
          <div className="product-color-swatches">
            {product.colors.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setColorIndex(index)}
                className={`product-color-swatch${colorIndex === index ? " product-color-swatch-active" : ""}`}
                aria-label={item.name}
              >
                <svg width="100%" height="100%" aria-hidden="true">
                  <rect width="100%" height="100%" fill={item.hex} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {product.sizes.length > 0 ? (
        <div className="product-option">
          <span className="product-option-label">Size</span>
          <div className="product-size-list">
            {product.sizes.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSize(value)}
                className={`product-size-btn ${size === value ? "product-size-btn-active" : "product-size-btn-inactive"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="product-option">
        <span className="product-option-label">Quantity</span>
        <div className="product-qty">
          <button
            type="button"
            className="product-qty-btn"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <IconMinus />
          </button>
          <span className="product-qty-value">{quantity}</span>
          <button
            type="button"
            className="product-qty-btn"
            aria-label="Increase quantity"
            onClick={() => setQuantity((value) => Math.min(20, value + 1))}
          >
            <IconPlus />
          </button>
        </div>
      </div>
      <div className="product-actions">
        <form action={addToCartAction}>
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="quantity" value={quantity} />
          {size ? <input type="hidden" name="size" value={size} /> : null}
          {color ? <input type="hidden" name="color" value={color.name} /> : null}
          <button type="submit" className="product-btn-cart">
            Add To Cart
          </button>
        </form>
        <form action={buyNowAction}>
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="quantity" value={quantity} />
          {size ? <input type="hidden" name="size" value={size} /> : null}
          {color ? <input type="hidden" name="color" value={color.name} /> : null}
          <button type="submit" className="product-btn-buy">
            Buy It Now
          </button>
        </form>
        <form action={toggleWishlistAction}>
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit" className="product-wishlist-btn">
            <IconHeart />
            {product.wished ? "Saved to Wishlist" : "Add to Wishlist"}
          </button>
        </form>
      </div>
      <div className="product-trust-row">
        <div className="product-trust-item">
          <IconTruck />
          Free Shipping
        </div>
        <div className="product-trust-item">
          <IconShield />
          Easy Returns
        </div>
        <div className="product-trust-item">
          <IconShield />
          Secure Payment
        </div>
      </div>
    </div>
  );
}
