import { COLLECTION_HEROES } from "@/constants/site";
import { toCatalogProduct } from "@/features/catalog/map-product";
import { ProductGrid } from "@/features/catalog/product-grid";
import { readWishlist } from "@/lib/wishlist-cookie";
import { productService } from "@/server/services/products/product.service";

export async function CollectionView({ category }: { category: string }) {
  const slug = category in COLLECTION_HEROES ? category : "all";
  const hero = COLLECTION_HEROES[slug] ?? COLLECTION_HEROES.all;
  const [result, wishlist] = await Promise.all([
    productService.list({ category: slug, limit: 48 }),
    readWishlist(),
  ]);
  const products = result.products.map(toCatalogProduct);
  const splitIndex = Math.min(6, products.length);
  const before = products.slice(0, splitIndex);
  const after = products.slice(splitIndex);

  if (!hero) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <section className={`collection-hero collection-hero--${slug}`}>
        <div className="collection-hero-bg">
          <picture className="collection-hero-picture">
            <source srcSet={hero.webp} type="image/webp" />
            <img src={hero.jpg} className="collection-hero-bg-image" alt={hero.alt} />
          </picture>
          <div className="collection-hero-bg-gradient" aria-hidden="true" />
        </div>
        <div className="collection-hero-content">
          <h1 className="collection-hero-title">
            {hero.first} <span className="collection-hero-title-accent">{hero.second}</span>
          </h1>
          <div className="collection-hero-divider" aria-hidden="true" />
        </div>
      </section>
      <section className="mx-auto max-w-[1600px] px-6 py-16 md:px-20">
        {before.length > 0 ? <ProductGrid products={before} wishlistIds={wishlist.ids} /> : null}
        {products.length > 0 ? (
          <div className={`collection-banner collection-banner--${slug}`} aria-label={hero.alt}>
            <picture className="collection-banner-picture">
              <source srcSet={hero.webp} type="image/webp" />
              <img src={hero.jpg} className="collection-banner-img" alt={hero.alt} />
            </picture>
          </div>
        ) : null}
        {after.length > 0 ? <ProductGrid products={after} wishlistIds={wishlist.ids} /> : null}
        {products.length === 0 ? (
          <div className="py-40 text-center">
            <p className="text-xl italic text-text-muted">More formulas arriving soon...</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
