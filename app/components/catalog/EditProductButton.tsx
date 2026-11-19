'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditProductModal, { type CategoryOption, type EditableProduct } from './EditProductModal';

interface EditProductButtonProps {
  product: EditableProduct;
  categories: CategoryOption[];
}

export default function EditProductButton({ product, categories }: EditProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className="product-edit"
        aria-label="Editar produto"
        title="Editar produto"
        onClick={() => setIsOpen(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
          <path d="m13.5 6.5 4 4" />
        </svg>
      </button>
      {isOpen && (
        <EditProductModal
          product={product}
          categories={categories}
          onClose={() => setIsOpen(false)}
          onSaved={() => {
            setIsOpen(false);
            router.refresh();
          }}
          onDeleted={() => {
            router.push('/perfil'); 
            router.refresh();
          }}
        />
      )}
    </>
  );
}