import Image from "next/image";
import type { Store } from "@/lib/store";

export default function StoreBanner({
  store,
  isOwner,
}: {
  store: Store;
  isOwner: boolean;
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
          <button type="button" aria-label="Editar loja" disabled>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
            </svg>
          </button>
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
