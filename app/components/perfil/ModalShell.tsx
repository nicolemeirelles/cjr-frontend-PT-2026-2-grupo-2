'use client';
// app/components/perfil/ModalShell.tsx
//
// "Moldura" reaproveitável de modal: fundo escuro, caixa cinza, botão X, seta de voltar
// (opcional), ESC para fechar e página de trás travada. Os modais de perfil e senha usam ela,
// assim cada um só cuida do próprio formulário.

import { useEffect, type ReactNode } from 'react';
import '@/app/components/catalog/ModalProduct.css';
import './perfil-modals.css';

interface ModalShellProps {
  labelledBy: string; // id do título, para o leitor de tela
  onClose: () => void;
  onBack?: () => void; // se existir, mostra a seta de voltar
  children: ReactNode;
}

export default function ModalShell({ labelledBy, onClose, onBack, children }: ModalShellProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="product-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="product-modal profile-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {onBack && (
          <button type="button" className="profile-modal__back" aria-label="Voltar" onClick={onBack}>
            <svg width="14" height="24" viewBox="0 0 14 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2 2 12l10 10" />
            </svg>
          </button>
        )}
        <button type="button" className="product-modal__close" aria-label="Fechar" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}