import { visibleShopCategories } from "@/constants/storefront";
import { BestSellers } from "@/features/catalog/best-sellers";
import { BrandStory } from "@/features/catalog/brand-story";
import { Features } from "@/features/catalog/features";
import { GlowStats } from "@/features/catalog/glow-stats";
import { HeroHome } from "@/features/catalog/hero-home";
import { HomeFaq } from "@/features/catalog/home-faq";
import { HomeTestimonials } from "@/features/catalog/home-testimonials";
import { ProductHighlights } from "@/features/catalog/product-highlights";
import { resolveBestSellers } from "@/features/catalog/resolve-best-sellers";
import { RibbonMarquee } from "@/features/catalog/ribbon-marquee";
import { RitualFinder } from "@/features/catalog/ritual-finder";
import { ShopByCategory } from "@/features/catalog/shop-by-category";
import { HomeMotion } from "@/features/motion/home-motion";
import { productService } from "@/lib/api/products";
import { getStorefront } from "@/lib/storefront";
import { readWishlist } from "@/lib/wishlist-cookie";

export default async function HomePage() {
  const [storefront, wishlist] = await Promise.all([getStorefront(), readWishlist()]);
  const products = await productService.getBySkus(storefront.content.bestSellerSkus);
  const bestSellers = resolveBestSellers(products, wishlist.ids, storefront.content.bestSellerColors);
  const lifestyleImage = storefront.content.brandStoryPortraitSrc || storefront.content.glowStatsImage;

  return (
    <div className="home-flow">
      <HomeMotion />
      <HeroHome content={storefront.content} />
      <RibbonMarquee tone="lime" pathId="heroRibbonPath" merged />
      <RitualFinder />
      <ShopByCategory categories={visibleShopCategories(storefront.content)} />
      <BestSellers items={bestSellers} currency={storefront.commerce.currency} />
      <ProductHighlights
        image={storefront.content.productHighlightsImage}
        floats={storefront.content.productHighlightsFloats}
      />
      <BrandStory content={storefront.content} />
      <RibbonMarquee tone="lime" pathId="storyRibbonPath" />
      <Features content={storefront.content} />
      <HomeTestimonials />
      <HomeFaq content={storefront.content} />
      <GlowStats image={lifestyleImage} />
    </div>
  );
}
