import { visibleShopCategories } from "@/constants/storefront";
import { BestSellers } from "@/features/catalog/best-sellers";
import { BrandStory } from "@/features/catalog/brand-story";
import { CraftedForEveryRide } from "@/features/catalog/crafted-for-every-ride";
import { CustomYourTack } from "@/features/catalog/custom-your-tack";
import { Features } from "@/features/catalog/features";
import { GlowStats } from "@/features/catalog/glow-stats";
import { HeroHome } from "@/features/catalog/hero-home";
import { HomeFaq } from "@/features/catalog/home-faq";
import { HomeTestimonials } from "@/features/catalog/home-testimonials";
import { ProductHighlights } from "@/features/catalog/product-highlights";
import { resolveBestSellers } from "@/features/catalog/resolve-best-sellers";
import { RitualFinder } from "@/features/catalog/ritual-finder";
import { SeenInTheSaddle } from "@/features/catalog/seen-in-the-saddle";
import { ShopByCategory } from "@/features/catalog/shop-by-category";
import { SizeFitGuide } from "@/features/catalog/size-fit-guide";
import { HomeMotion } from "@/features/motion/home-motion";
import { productService } from "@/lib/api/products";
import { getStorefront } from "@/lib/storefront";
import { readWishlist } from "@/lib/wishlist-cookie";

export default async function HomePage() {
  const [storefront, wishlist] = await Promise.all([getStorefront(), readWishlist()]);
  const products = await productService.getBySkus(storefront.content.bestSellerSkus);
  const bestSellers = resolveBestSellers(products, wishlist.ids, storefront.content.bestSellerColors);

  return (
    <div className="home-flow">
      <HomeMotion />
      {/* 02 Hero */}
      <HeroHome content={storefront.content} />
      {/* 03 Find the right tack */}
      <RitualFinder />
      {/* 04 Shop by category */}
      <ShopByCategory categories={visibleShopCategories(storefront.content)} />
      {/* 05 Best sellers */}
      <BestSellers items={bestSellers} currency={storefront.commerce.currency} />
      {/* 06 Why Oak & Rein */}
      <Features content={storefront.content} />
      {/* 07 Craftsmanship highlights */}
      <ProductHighlights
        image={storefront.content.productHighlightsImage}
        floats={storefront.content.productHighlightsFloats}
      />
      {/* 08 Crafted for every ride */}
      <CraftedForEveryRide content={storefront.content.disciplinesSection} />
      {/* 09 Custom your tack */}
      <CustomYourTack content={storefront.content.customTack} />
      {/* 10 Brand story */}
      <BrandStory content={storefront.content} />
      {/* 11 Rider gallery */}
      <SeenInTheSaddle content={storefront.content.riderGallery} />
      {/* 12 Testimonials */}
      <HomeTestimonials />
      {/* 13 Size & fit */}
      <SizeFitGuide />
      {/* 14–16 Trust / FAQ / Final CTA */}
      <HomeFaq content={storefront.content} />
      <GlowStats image={storefront.content.glowStatsImage} />
    </div>
  );
}
