import dynamic from "next/dynamic";

import { visibleShopCategories } from "@/constants/storefront";
import { BestSellers } from "@/features/catalog/best-sellers";
import { HeroHome } from "@/features/catalog/hero-home";
import { resolveBestSellers } from "@/features/catalog/resolve-best-sellers";
import { RitualFinder } from "@/features/catalog/ritual-finder";
import { ShopByCategory } from "@/features/catalog/shop-by-category";
import { HomeMotion } from "@/features/motion/home-motion";
import { productService } from "@/lib/api/products";
import { getStorefront } from "@/lib/storefront";
import { readWishlist } from "@/lib/wishlist-cookie";

/** CMS-driven homepage — never serve a stale published storefront snapshot. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Below-the-fold chunks hydrate after the hero — keeps cold navigations snappy. */
const Features = dynamic(() => import("@/features/catalog/features").then((m) => m.Features));
const ProductHighlights = dynamic(() =>
  import("@/features/catalog/product-highlights").then((m) => m.ProductHighlights),
);
const CraftedForEveryRide = dynamic(() =>
  import("@/features/catalog/crafted-for-every-ride").then((m) => m.CraftedForEveryRide),
);
const CustomYourTack = dynamic(() =>
  import("@/features/catalog/custom-your-tack").then((m) => m.CustomYourTack),
);
const BrandStory = dynamic(() => import("@/features/catalog/brand-story").then((m) => m.BrandStory));
const SeenInTheSaddle = dynamic(() =>
  import("@/features/catalog/seen-in-the-saddle").then((m) => m.SeenInTheSaddle),
);
const HomeTestimonials = dynamic(() =>
  import("@/features/catalog/home-testimonials").then((m) => m.HomeTestimonials),
);
const SizeFitGuide = dynamic(() =>
  import("@/features/catalog/size-fit-guide").then((m) => m.SizeFitGuide),
);
const HomeFaq = dynamic(() => import("@/features/catalog/home-faq").then((m) => m.HomeFaq));
const GlowStats = dynamic(() => import("@/features/catalog/glow-stats").then((m) => m.GlowStats));

export default async function HomePage() {
  const [storefront, wishlist] = await Promise.all([getStorefront(), readWishlist()]);
  const products = await productService.getBySkus(storefront.content.bestSellerSkus);
  const bestSellers = resolveBestSellers(products, wishlist.ids, storefront.content.bestSellerColors);

  return (
    <div className="home-flow">
      <HomeMotion />
      <HeroHome content={storefront.content} />
      <RitualFinder />
      <ShopByCategory categories={visibleShopCategories(storefront.content)} />
      <BestSellers items={bestSellers} currency={storefront.commerce.currency} />
      <Features content={storefront.content} />
      <ProductHighlights
        image={storefront.content.productHighlightsImage}
        floats={storefront.content.productHighlightsFloats}
      />
      <CraftedForEveryRide content={storefront.content.disciplinesSection} />
      <CustomYourTack content={storefront.content.customTack} />
      <BrandStory content={storefront.content} />
      <SeenInTheSaddle content={storefront.content.riderGallery} />
      <HomeTestimonials />
      <SizeFitGuide />
      <HomeFaq content={storefront.content} />
      <GlowStats image={storefront.content.glowStatsImage} />
    </div>
  );
}
