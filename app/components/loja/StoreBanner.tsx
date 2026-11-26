import type { ReactNode } from "react";
import Image from "next/image";
import type { Store } from "@/lib/store";
import EditStoreButton from "./EditStoreButton";
import type { StoreCategory } from "./StoreModal";

export default function StoreBanner({
  store,
  isOwner,
  categories,
  addProductButton,
}: {
  store: Store;
  isOwner: boolean;
  categories: StoreCategory[];
  addProductButton?: ReactNode; 
}) {
  return (
    <section className="store-banner" aria-labelledby="store-name">
      {store.bannerUrl && (
        <>
          <Image
            className="store-banner-image"
            src={store.bannerUrl}
            alt=""
            fill
            priority
            unoptimized
          />
          <div className="store-banner-shade" />
        </>
      )}
      <div className="store-banner-title">
        <h1 id="store-name">{store.name}</h1>
        <p>{store.categoryName}</p>
      </div>
      <p className="store-owner">by {store.ownerName}</p>
      {isOwner && (
        <div className="store-actions">
          <EditStoreButton store={store} categories={categories} />
          {addProductButton}
        </div>
      )}
    </section>
  );
}