import { type CatalogProduct, ProductCard } from "@/features/catalog/product-card";

const FALLBACK_COLORS = ["#f0c5bf", "#d5e4cf", "#efe4ee"];

export function ProductGrid({
  products,
  wishlistIds,
  currency = "PKR",
  tileColors,
}: {
  products: CatalogProduct[];
  wishlistIds: string[];
  columns?: 3 | 4;
  currency?: string;
  tileColors?: string[];
}) {
  const palette = tileColors && tileColors.length > 0 ? tileColors : FALLBACK_COLORS;
  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          wished={wishlistIds.includes(product.id)}
          color={product.tileColor || palette[index % palette.length] || "#f0c5bf"}
          currency={currency}
        />
      ))}
    </div>
  );
}
