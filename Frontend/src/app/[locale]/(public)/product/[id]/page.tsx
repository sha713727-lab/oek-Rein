import Link from "next/link";
import { notFound } from "next/navigation";

import { CATEGORY_LABELS, getCategoryPath } from "@/constants/catalog";
import { productImageUrls, toCatalogProduct } from "@/features/catalog/map-product";
import { ProductBuyBox } from "@/features/catalog/product-buy-box";
import { ProductGallery } from "@/features/catalog/product-gallery";
import { ProductGrid } from "@/features/catalog/product-grid";
import { ProductTabs } from "@/features/catalog/product-tabs";
import { CmsImage } from "@/features/media/cms-image";
import { productService } from "@/lib/api/products";
import { getStorefront } from "@/lib/storefront";
import { readWishlist } from "@/lib/wishlist-cookie";
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
  const uniqueImages = images.filter((image, index) => images.indexOf(image) === index);
  const category = product.category;
  const related = (await productService.list({ category, limit: 8 })).products
    .filter((item) => item.id !== product.id)
    .slice(0, 3)
    .map(toCatalogProduct);
  const wishlist = await readWishlist();
  const storefront = await getStorefront();
  const wished = wishlist.ids.includes(product.id);
  const featureImage = uniqueImages[1];
  const words = product.title.trim().split(/\s+/);
  const titleAccent = words.length > 1 ? words.pop() : "";
  const titlePrimary = words.join(" ") || product.title;
  const highlights = product.description.highlights.slice(0, 3);

  return (
    <div className="product-detail-page">
      <div className="product-detail-inner">
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
          <ProductGallery images={uniqueImages} title={product.title} />
          <ProductBuyBox
            currency={storefront.commerce.currency}
            product={{
              id: product.id,
              title: product.title,
              sku: product.sku,
              category: CATEGORY_LABELS[category] ?? "Saddlera",
              intro: product.description.intro,
              volume: product.specifications.includes,
              price: product.effectivePrice,
              originalPrice: product.originalPrice,
              sizes: [...product.sizes],
              colors: product.colors.map((item) => ({ name: item.name, hex: item.hex })),
              howToUse: product.specifications.care,
              wished,
              stock: product.stock,
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
            <div className="product-feature-well">
              <CmsImage
                src={featureImage}
                alt={`${product.title} detail`}
                fill
                sizes="(min-width: 1024px) 28vw, 80vw"
                className="product-feature-still"
              />
            </div>
            <div className="product-feature-copy">
              <p className="product-feature-label">In The Collection</p>
              <h2 className="product-feature-title">
                {titlePrimary}
                {titleAccent ? (
                  <>
                    {" "}
                    <span className="product-feature-title-accent">{titleAccent}</span>
                  </>
                ) : null}
              </h2>
              <p className="product-feature-desc">{product.description.detail || product.description.intro}</p>
              {highlights.length > 0 ? (
                <ul className="product-feature-list">
                  {highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
        {related.length > 0 ? (
          <section className="product-carousel-section product-carousel-section--last">
            <h2 className="product-section-title">
              Complete <span className="product-section-title-accent">The Look</span>
            </h2>
            <ProductGrid products={related} wishlistIds={wishlist.ids} currency={storefront.commerce.currency} tileColors={storefront.content.productCardColors} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
