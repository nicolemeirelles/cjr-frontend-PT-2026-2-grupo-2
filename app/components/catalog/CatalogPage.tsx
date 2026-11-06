import { League_Spartan } from 'next/font/google';
import Image from 'next/image';
import { getDemoCatalog } from '@/lib/catalog/demo';
import type { CatalogData } from '@/lib/catalog/types';
import { getCurrentUser } from '@/lib/auth';
import Navbar from './Navbar';
import Catalog from './Catalog';
import './catalog.css';
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
  searchParams,
  data = getDemoCatalog(),
}: {
  searchParams: Promise<CatalogSearch>;
  data?: CatalogData;
}) {
  const search = await searchParams;
  const demo = data.source === 'demo';
  const session = await getCurrentUser();
  return (
    <div className={`catalog-page ${leagueSpartan.className}`}>
      <Navbar authenticated={session.status === 'authenticated'} demo={demo} />
      <main>
        <section
          className="catalog-hero"
          aria-label="Bem-vindo ao Stock.io"
        >
          <div className="catalog-hero-inner">
            <h1>
              Do CAOS à organização,
              <br />
              em alguns cliques
            </h1>
            <Image
              src="/catalogo/mascote-home.svg"
              alt=""
              width={832}
              height={1129}
              unoptimized
              priority
            />
          </div>
        </section>
        <Catalog
          data={data}
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
