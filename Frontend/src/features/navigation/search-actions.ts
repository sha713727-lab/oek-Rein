"use server";

import { productService } from "@/server/services/products/product.service";

export type SearchHit = {
  id: string;
  title: string;
  sku: string;
  price: number;
  image: string | null;
};

export async function searchProductsAction(query: string): Promise<SearchHit[]> {
  const products = await productService.searchStorefront(query, 8);
  return products.map((product) => ({
    id: product.id,
    title: product.title,
    sku: product.sku,
    price: product.effectivePrice,
    image: product.images[0]?.url ?? null,
  }));
}
