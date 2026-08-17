import { CollectionView } from "@/features/catalog/collection-view";

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
