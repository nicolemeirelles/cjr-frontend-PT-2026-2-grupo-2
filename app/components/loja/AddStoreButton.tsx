"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import StoreModal, { type StoreCategory } from "./StoreModal";

export default function AddStoreButton({
  categories,
}: {
  categories: StoreCategory[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className="profile-edit profile-add-store"
        onClick={() => setOpen(true)}
      >
        Adicionar loja
      </button>

      {open && (
        <StoreModal
          categories={categories}
          onClose={() => setOpen(false)}
          onSaved={(storeId) => router.push(`/lojas/${storeId}`)}
        />
      )}
    </>
  );
}
