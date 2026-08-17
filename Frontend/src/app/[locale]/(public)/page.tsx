import { visibleShopCategories } from "@/constants/storefront";
import { BestSellers } from "@/features/catalog/best-sellers";
import { BrandStory } from "@/features/catalog/brand-story";
import { Features } from "@/features/catalog/features";
import { GlowStats } from "@/features/catalog/glow-stats";
import { HeroHome } from "@/features/catalog/hero-home";
import { HomeFaq } from "@/features/catalog/home-faq";
import { ProductHighlights } from "@/features/catalog/product-highlights";
import { resolveBestSellers } from "@/features/catalog/resolve-best-sellers";
import { ShopByCategory } from "@/features/catalog/shop-by-category";
import { productService } from "@/lib/api/products";
import { getStorefront } from "@/lib/storefront";
import { readWishlist } from "@/lib/wishlist-cookie";

export default async function HomePage() {
  const [storefront, wishlist] = await Promise.all([
    getStorefront(),
    readWishlist(),
    productService.ensureBestSellers(),
  ]);
  const products = await productService.getBySkus(storefront.content.bestSellerSkus);
  const bestSellers = resolveBestSellers(products, wishlist.ids, storefront.content.bestSellerColors);

  return (
    <div className="home-flow bg-brand-bg">
      <HeroHome content={storefront.content} />
      <ShopByCategory categories={visibleShopCategories(storefront.content)} />
      <BestSellers items={bestSellers} currency={storefront.commerce.currency} />
      <BrandStory content={storefront.content} />
      <ProductHighlights image={storefront.content.productHighlightsImage} />
      <GlowStats image={storefront.content.glowStatsImage} />
      <Features content={storefront.content} />
      <HomeFaq content={storefront.content} />
    </div>
  );
}
