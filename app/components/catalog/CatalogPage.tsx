import { League_Spartan } from 'next/font/google';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getDemoCatalog } from '@/lib/catalog/demo';
import type { CatalogData } from '@/lib/catalog/types';
import { getCurrentUser } from '@/lib/auth';
import Navbar from './Navbar';
import Catalog from './Catalog';
import './catalog.css';
import './category.css';
const leagueSpartan = League_Spartan({ subsets: ['latin'], display: 'swap' });
export type CatalogSearch = {
  demo?: string;
  q?: string;
  view?: string;
};
export function CatalogFallback() {
  return (
    <div className={`catalog-page ${leagueSpartan.className}`} aria-busy="true">
      <Navbar authenticated={false} demo={false} />
      <main className="catalog-loading" role="status">
        <span className="catalog-loading-dot" />
        Carregando catálogo…
      </main>
    </div>
  );
}
export default async function CatalogPage({
  params,
  searchParams,
  data = getDemoCatalog(),
}: {
  params?: Promise<{
    id: string;
  }>;
  searchParams: Promise<CatalogSearch>;
  data?: CatalogData;
}) {
  const [search, route] = await Promise.all([searchParams, params]);
  const demo = data.source === 'demo';
  const session = await getCurrentUser();
  const categoryId = route ? Number(route.id) : undefined;
  if (
    categoryId !== undefined &&
    (!Number.isSafeInteger(categoryId) || categoryId <= 0)
  )
    notFound();
  const category = data.categories.find((item) => item.id === categoryId);
  const electronics =
    category?.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase() === 'eletronicos';
  return (
    <div className={`catalog-page ${leagueSpartan.className}`}>
      <Navbar authenticated={session.status === 'authenticated'} demo={demo} />
      <main>
        <section
          className={`catalog-hero ${electronics ? 'catalog-hero-electronics' : ''}`}
          aria-label={
            category ? `Categoria ${category.name}` : 'Bem-vindo ao Stock.io'
          }
        >
          <div className="catalog-hero-inner">
            <h1>
              {electronics ? (
                <>
                  O universo da tecnologia
                  <br />
                  em um só lugar
                </>
              ) : category ? (
                <>
                  {category.name}
                  <br />
                  Encontre o que combina com você
                </>
              ) : (
                <>
                  Do CAOS à organização,
                  <br />
                  em alguns cliques
                </>
              )}
            </h1>
            <Image
              src={`/catalogo/mascote-${electronics ? 'eletronicos' : 'home'}.svg`}
              alt=""
              width={electronics ? 425 : 832}
              height={electronics ? 1097 : 1129}
              unoptimized
              priority
            />
          </div>
        </section>
        <Catalog
          key={categoryId ?? 'home'}
          data={data}
          categoryId={categoryId}
          initialQuery={search.q}
          initialView={search.view}
        />
      </main>
      <footer className="catalog-footer">
        <p>Stock.io</p>
        <span>Do caos à organização, em alguns cliques.</span>
      </footer>
    </div>
  );
}
