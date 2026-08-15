import { BestSellers } from "@/features/catalog/best-sellers";
import { BrandStory } from "@/features/catalog/brand-story";
import { Features } from "@/features/catalog/features";
import { GlowStats } from "@/features/catalog/glow-stats";
import { HeroHome } from "@/features/catalog/hero-home";
import { HomeFaq } from "@/features/catalog/home-faq";
import { ProductHighlights } from "@/features/catalog/product-highlights";
import { resolveBestSellers } from "@/features/catalog/resolve-best-sellers";
import { ShopByCategory } from "@/features/catalog/shop-by-category";
import { readWishlist } from "@/lib/wishlist-cookie";
import { productService } from "@/server/services/products/product.service";

export default async function HomePage() {
  const [products, wishlist] = await Promise.all([productService.ensureBestSellers(), readWishlist()]);
  const bestSellers = resolveBestSellers(products, wishlist.ids);

  return (
    <div className="home-flow bg-brand-bg">
      <HeroHome />
      <ShopByCategory />
      <BestSellers items={bestSellers} />
      <BrandStory />
      <ProductHighlights />
      <GlowStats />
      <Features />
      <HomeFaq />
    </div>
  );
}
