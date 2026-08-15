import { type CatalogProduct,ProductCard } from "@/features/catalog/product-card";

export function ProductGrid({
  products,
  wishlistIds,
  columns = 3,
}: {
  products: CatalogProduct[];
  wishlistIds: string[];
  columns?: 3 | 4;
}) {
  const gridClass = columns === 4 ? "grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-5" : "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} wished={wishlistIds.includes(product.id)} />
      ))}
    </div>
  );
}
