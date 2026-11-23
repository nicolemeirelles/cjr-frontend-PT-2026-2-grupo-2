'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateProductModal, { type Category } from './CreateModalProduct';
import './addproductbutton.css';

interface AddProductButtonProps {
  storeId?: number; 
  categories: Category[];
  className?: string;
}

export default function AddProductButton({
  storeId,
  categories,
  className = 'add-product-btn',
}: AddProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label="Adicionar produto"
        title={storeId === undefined ? 'Crie uma loja antes de adicionar produtos' : 'Adicionar produto'}
        disabled={storeId === undefined} 
        onClick={() => setIsOpen(true)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
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