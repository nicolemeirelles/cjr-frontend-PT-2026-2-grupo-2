"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import StoreModal, { type EditableStore, type StoreCategory } from "./StoreModal";

export default function EditStoreButton({
  store,
  categories,
}: {
  store: EditableStore;
  categories: StoreCategory[];
}) {
  const [modalRoot, setModalRoot] = useState<Element | null>(null);
  const router = useRouter();
  const close = () => setModalRoot(null);

  return (
    <>
      <button
        type="button"
        aria-label="Editar loja"
        onClick={(e) =>
          setModalRoot(e.currentTarget.closest(".store-page") ?? document.body)
        }
      >
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

      {modalRoot &&
        createPortal(
          <StoreModal
            categories={categories}
            store={store}
            onClose={close}
            onSaved={() => {
              close();
              router.refresh();
            }}
            onDeleted={() => {
              router.push("/perfil");
              router.refresh();
            }}
          />,
          modalRoot,
        )}
    </>
  );
}
