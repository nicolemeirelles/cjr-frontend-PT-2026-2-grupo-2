import Image from "next/image";
import type { Store } from "@/lib/store";
import EditStoreButton from "./EditStoreButton";
import type { StoreCategory } from "./StoreModal";

export default function StoreBanner({
  store,
  isOwner,
  categories,
}: {
  store: Store;
  isOwner: boolean;
  categories: StoreCategory[];
}) {
  return (
    <section
      className={`store-banner${store.bannerUrl ? " store-banner--image" : ""}`}
      aria-labelledby="store-name"
    >
      {store.bannerUrl && (
        <Image
          className="store-banner-image"
          src={store.bannerUrl}
          alt=""
          fill
          priority
          unoptimized
        />
      )}
      <div className="store-banner-title">
        <h1 id="store-name">{store.name}</h1>
        <p>{store.categoryName}</p>
      </div>
      <p className="store-owner">by {store.ownerName}</p>
      {isOwner && (
        <div className="store-actions">
          <EditStoreButton store={store} categories={categories} />
          <button type="button" aria-label="Adicionar produto" disabled>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
