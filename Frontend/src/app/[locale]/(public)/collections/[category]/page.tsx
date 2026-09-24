import type { Metadata } from "next";

import { brandName } from "@/constants/brand";
import { COLLECTION_HEROES } from "@/constants/site";
import { CollectionView } from "@/features/catalog/collection-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const hero = COLLECTION_HEROES[category];
  if (!hero) {
    return { title: `Collection | ${brandName}` };
  }
  const title = `${hero.first} ${hero.second}`;
  return {
    title: `${title} | ${brandName}`,
    description: `Shop ${title.toLowerCase()} from ${brandName} — handcrafted Pakistani leather equestrian gear.`,
  };
}

export default async function CollectionCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { category } = await params;
  const query = await searchParams;
  return <CollectionView category={category} sort={query.sort} page={Number(query.page ?? 1)} />;
}
