'use client';

import { useEffect, useRef, useState } from 'react';
import type { RatingComment } from '@/lib/comments';
import { isRatingComment } from '@/lib/comments';
import './comments.css';

type Props = {
  onClose: () => void;
  onSaved: (comment: RatingComment) => void;
  submit: (content: string) => Promise<Response>;
  initialContent?: string;
  title?: string;
  buttonLabel?: string;
};

export default function CommentModal({ onClose, onSaved, submit, initialContent = '', title = 'Criar comentário', buttonLabel = 'Comentar' }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [content, setContent] = useState(initialContent);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const text = content.trim();
    if (!text || text.length > 500) {
      setError('Escreva um comentário de até 500 caracteres.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const response = await submit(text);
      const data: unknown = await response.json();
      if (!response.ok) {
        const message = data && typeof data === 'object' && 'message' in data ? data.message : null;
        throw new Error(typeof message === 'string' ? message : 'Não foi possível salvar. Tente novamente.');
      }
      if (!isRatingComment(data)) throw new Error('Resposta inválida do servidor. Atualize a página para conferir o comentário.');
      onSaved(data);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog ref={dialog} className="comment-modal" aria-label={title} onCancel={(event) => {
      event.preventDefault();
      if (!pending) onClose();
    }}>
      <button type="button" className="comment-close" aria-label="Fechar comentário" disabled={pending} onClick={onClose}>×</button>
      <form onSubmit={save} aria-busy={pending}>
        <label className="comment-label" htmlFor="comment-content">{title}</label>
        <textarea id="comment-content" autoFocus required maxLength={500} value={content}
          placeholder="Comentário" disabled={pending} aria-describedby="comment-count comment-error"
          onChange={(event) => setContent(event.target.value)} />
        <div className="comment-count" id="comment-count">{content.length}/500</div>
        <p className="comment-error" id="comment-error" role="alert">{error}</p>
        <button className="comment-save" disabled={pending || !content.trim()} type="submit">{pending ? 'Salvando…' : buttonLabel}</button>
      </form>
    </dialog>
  );
}
