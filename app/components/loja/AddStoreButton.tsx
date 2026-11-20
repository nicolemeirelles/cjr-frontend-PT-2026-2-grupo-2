"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateStoreModal, { type StoreCategory } from "./CreateStoreModal";

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
        <CreateStoreModal
          categories={categories}
          onClose={() => setOpen(false)}
          onCreated={(storeId) => router.push(`/lojas/${storeId}`)}
        />
      )}
    </>
  );
}
