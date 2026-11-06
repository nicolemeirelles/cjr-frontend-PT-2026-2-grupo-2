import { Suspense } from 'react';
import { getCatalog } from '@/lib/catalog/api';
import { getDemoCatalog } from '@/lib/catalog/demo';
import CatalogPage, {
  CatalogFallback,
  type CatalogSearch,
} from './components/catalog/CatalogPage';
export default function Home({
  searchParams,
}: {
  searchParams: Promise<CatalogSearch>;
}) {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <Feed searchParams={searchParams} />
    </Suspense>
  );
}

async function Feed({
  searchParams,
}: {
  searchParams: Promise<CatalogSearch>;
}) {
  const search = await searchParams;
  const data = search.demo === '1' ? getDemoCatalog() : await getCatalog();
  return <CatalogPage searchParams={Promise.resolve(search)} data={data} />;
}
