'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateProductModal, { type Category } from './CreateModalProduct';
import './addproductbutton.css';

interface AddProductButtonProps {
  storeId?: number; 
  categories: Category[];
}

export default function AddProductButton({ storeId, categories }: AddProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className="add-product-btn"
        aria-label="Adicionar produto"
        title={storeId === undefined ? 'Crie uma loja antes de adicionar produtos' : 'Adicionar produto'}
        disabled={storeId === undefined} 
        onClick={() => setIsOpen(true)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M12 4v16M4 12h16" />
        </svg>
      </button>

      {storeId !== undefined && (
        <CreateProductModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={() => router.refresh()}
          storeId={storeId}
          categories={categories}
        />
      )}
    </>
  );
}