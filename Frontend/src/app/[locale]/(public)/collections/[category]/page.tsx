import { CollectionView } from "@/features/catalog/collection-view";

export default async function CollectionCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <CollectionView category={category} />;
}
