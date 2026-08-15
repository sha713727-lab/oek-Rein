import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CATEGORY_LABELS, getCategoryPath } from "@/constants/catalog";
import { productImageUrls, toCatalogProduct } from "@/features/catalog/map-product";
import { ProductBuyBox } from "@/features/catalog/product-buy-box";
import { ProductGallery } from "@/features/catalog/product-gallery";
import { ProductGrid } from "@/features/catalog/product-grid";
import { ProductTabs } from "@/features/catalog/product-tabs";
import { readWishlist } from "@/lib/wishlist-cookie";
import { productService } from "@/server/services/products/product.service";
import type { SerializedProduct } from "@/types/product";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product: SerializedProduct;
  try {
    product = await productService.details(id);
  } catch {
    notFound();
  }

  const images = productImageUrls(product);
  const category = product.category;
  const related = (await productService.list({ category, limit: 8 })).products
    .filter((item) => item.id !== product.id)
    .slice(0, 4)
    .map(toCatalogProduct);
  const wishlist = await readWishlist();
  const wished = wishlist.ids.includes(product.id);
  const featureImage = images[1] ?? images[0];
  const words = product.title.trim().split(/\s+/);
  const titleAccent = words.length > 1 ? words.pop() : "";
  const titlePrimary = words.join(" ") || product.title;

  return (
    <div className="product-detail-page">
      <div className="mx-auto max-w-[1600px] px-6 md:px-20">
        <nav className="product-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/collections/all">Shop All</Link>
          <span>/</span>
          <Link href={getCategoryPath(category)}>{CATEGORY_LABELS[category] ?? "Shop All"}</Link>
          <span>/</span>
          <span className="text-text-sub">{product.title}</span>
        </nav>
        <div className="product-hero">
          <ProductGallery images={images} title={product.title} />
          <ProductBuyBox
            product={{
              id: product.id,
              title: product.title,
              sku: product.sku,
              price: product.effectivePrice,
              sizes: [...product.sizes],
              colors: product.colors.map((color) => ({ name: color.name, hex: color.hex })),
              wished,
            }}
          />
        </div>
        <ProductTabs
          product={{
            description: {
              intro: product.description.intro,
              detail: product.description.detail,
              highlights: [...product.description.highlights],
            },
            specifications: {
              composition: product.specifications.composition,
              care: product.specifications.care,
              includes: product.specifications.includes,
            },
            returnPolicy: product.returnPolicy,
          }}
        />
        {featureImage ? (
          <div className="product-feature-grid">
            <div className="product-feature-image">
              <Image src={featureImage} alt={`${product.title} detail`} fill className="object-cover" sizes="50vw" />
            </div>
            <div className="px-2 lg:px-6">
              <p className="product-feature-label">Craftsmanship</p>
              <h2 className="product-feature-title">
                {titlePrimary}
                {titleAccent ? (
                  <>
                    {" "}
                    <span className="product-feature-title-accent">{titleAccent}</span>
                  </>
                ) : null}
              </h2>
              <p className="product-feature-desc">{product.description.intro}</p>
            </div>
          </div>
        ) : null}
        {related.length > 0 ? (
          <section className="product-carousel-section">
            <h2 className="product-section-title">
              Complete <span className="product-section-title-accent">The Look</span>
            </h2>
            <ProductGrid products={related} wishlistIds={wishlist.ids} columns={4} />
          </section>
        ) : null}
      </div>
      {related.length > 0 ? (
        <div className="mx-auto max-w-[1600px] px-6 md:px-20">
          <section className="product-carousel-section product-carousel-section--last">
            <h2 className="product-section-title">You May Also Like</h2>
            <ProductGrid products={related} wishlistIds={wishlist.ids} columns={4} />
          </section>
        </div>
      ) : null}
    </div>
  );
}
