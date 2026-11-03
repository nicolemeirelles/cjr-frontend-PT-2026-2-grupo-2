import { Suspense } from 'react';
import CatalogPage, {
  CatalogFallback,
  type CatalogSearch,
} from '@/app/components/catalog/CatalogPage';
export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<CatalogSearch>;
}) {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogPage params={params} searchParams={searchParams} />
    </Suspense>
  );
}
