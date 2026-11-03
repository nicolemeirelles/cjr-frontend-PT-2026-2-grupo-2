import { Suspense } from 'react';
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
      <CatalogPage searchParams={searchParams} />
    </Suspense>
  );
}
