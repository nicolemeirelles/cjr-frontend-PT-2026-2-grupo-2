import { Suspense } from "react";
import { notFound } from "next/navigation";
import { League_Spartan } from "next/font/google";
import Navbar from "@/app/components/catalog/Navbar";
import ProductCard from "@/app/components/catalog/ProductCard";
import StoreBanner from "@/app/components/loja/StoreBanner";
import StoreReviews from "@/app/components/loja/StoreReviews";
import { getCurrentUser } from "@/lib/auth";
import { getStore, getStoreCategories, parseStoreId } from "@/lib/store";
import AddProductButton from "@/app/components/catalog/AddProductButton";
import { getCatalog } from "@/lib/catalog/api";
import { buildCategoryOptions } from "@/lib/catalog/category-options";
import "./loja.css";

const leagueSpartan = League_Spartan({ subsets: ["latin"], display: "swap" });

async function StoreContent({ params }: { params: Promise<{ id: string }> }) {
  const storeId = parseStoreId((await params).id);
  if (storeId === null) notFound();

  const [session, result] = await Promise.all([
    getCurrentUser(),
    getStore(storeId),
  ]);
  if (result.status === "not_found") notFound();

  const authenticated = session.status === "authenticated";
  const pageClass = `catalog-page store-page ${leagueSpartan.className}`;

  if (result.status === "unavailable") {
    return (
      <div className={pageClass}>
        <Navbar authenticated={authenticated} demo={false} />
        <main>
          <p role="status" className="store-message">
            Não foi possível carregar a loja. Tente novamente em instantes.
          </p>
        </main>
      </div>
    );
  }

  const { store } = result;
  const isOwner = authenticated && session.user.id === store.ownerId;
  const [categories, catalog] = isOwner
    ? await Promise.all([getStoreCategories(), getCatalog()])
    : [[], null];

  const productCategories =
    catalog?.source === "api"
      ? buildCategoryOptions(catalog.categories, store.categoryId)
      : [];

  return (
    <div className={pageClass}>
      <Navbar authenticated={authenticated} demo={false} />
      <main>
        <StoreBanner
          store={store}
          isOwner={isOwner}
          categories={categories}
          addProductButton={
            isOwner ? (
              <AddProductButton storeId={store.id} categories={productCategories} />
            ) : null
          }
        />
        <StoreReviews
          averageRating={store.averageRating}
          reviews={store.reviews}
        />
        <section
          className="store-products"
          aria-labelledby="store-products-title"
        >
          <h2 id="store-products-title">Produtos</h2>
          {store.products.length === 0 ? (
            <p className="store-empty">Esta loja ainda não tem produtos.</p>
          ) : (
            <div
              className="store-product-row"
              role="region"
              aria-label={`Produtos de ${store.name}`}
              tabIndex={0}
            >
              {store.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function StorePage({ params }: PageProps<"/lojas/[id]">) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center">
          Carregando loja...
        </p>
      }
    >
      <StoreContent params={params} />
    </Suspense>
  );
}4