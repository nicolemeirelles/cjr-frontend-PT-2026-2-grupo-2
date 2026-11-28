import { Suspense } from "react";
import Link from "next/link";
import { League_Spartan } from "next/font/google";
import Icon from "@/app/components/catalog/Icon";
import Navbar from "@/app/components/catalog/Navbar";
import StoreList from "@/app/components/loja/StoreList";
import { getCurrentUser } from "@/lib/auth";
import { getStoreCategories, getStores } from "@/lib/store";
import "@/app/components/catalog/category.css";
import "./lojas.css";

const leagueSpartan = League_Spartan({ subsets: ["latin"], display: "swap" });

async function StoresContent({
  searchParams,
}: {
  searchParams: PageProps<"/lojas">["searchParams"];
}) {
  const [search, session, stores, categories] = await Promise.all([
    searchParams,
    getCurrentUser(),
    getStores(),
    getStoreCategories(),
  ]);
  const query = typeof search.q === "string" ? search.q : "";

  return (
    <div className={`catalog-page stores-page ${leagueSpartan.className}`}>
      <Navbar
        authenticated={session.status === "authenticated"}
        demo={false}
        active="lojas"
      />
      <main>
        <section
          className="stores-categories"
          aria-labelledby="stores-categories-title"
        >
          <div className="stores-categories-inner">
            <h2 id="stores-categories-title">Categoria</h2>
            <div className="catalog-category-list">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categorias/${category.id}`}
                  className="catalog-category-item"
                >
                  <Icon name={category.name} size={37} />
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {stores === null ? (
          <div className="catalog-content">
            <div className="catalog-message" role="status">
              <h2>Não foi possível carregar as lojas</h2>
              <p>Tente novamente em instantes.</p>
            </div>
          </div>
        ) : (
          <StoreList
            stores={stores}
            categories={categories}
            initialQuery={query}
          />
        )}
      </main>
      <footer className="catalog-footer">
        <p>Stock.io</p>
        <span>Do caos à organização, em alguns cliques.</span>
      </footer>
    </div>
  );
}

export default function StoresPage({ searchParams }: PageProps<"/lojas">) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center">
          Carregando lojas...
        </p>
      }
    >
      <StoresContent searchParams={searchParams} />
    </Suspense>
  );
}
