'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isRatingComment, targetQuery, type CommentTarget, type RatingComment } from '@/lib/comments';
import CommentModal from './CommentModal';
import './comments.css';

export default function ReviewComments({ target, currentUserId }: { target: CommentTarget; currentUserId: number | null }) {
  const [comments, setComments] = useState<RatingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [creating, setCreating] = useState(false);
  const query = targetQuery(target);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/comentarios?${query}`, { signal: controller.signal, cache: 'no-store' });
        const data: unknown = await response.json();
        if (!response.ok || !Array.isArray(data) || !data.every(isRatingComment)) throw new Error('Não foi possível carregar os comentários.');
        setComments(data);
      } catch {
        if (!controller.signal.aborted) setError('Não foi possível carregar os comentários.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [query, attempt]);

  return (
    <section className="review-comments" aria-label="Comentários da avaliação">
      {loading ? <p role="status">Carregando comentários…</p> : error ? <p role="alert">{error} <button type="button" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button></p> : (
        <ul>{comments.map((comment) => <li key={comment.id}>
          <strong>{comment.user.name}</strong>
          <p>{comment.content}</p>
        </li>)}</ul>
      )}
      {currentUserId ? <button type="button" className="comment-action" disabled={loading || !!error} onClick={() => setCreating(true)}>Comentar</button>
        : <Link href="/login">Entre na sua conta para comentar</Link>}
      {creating && <CommentModal onClose={() => setCreating(false)} onSaved={(comment) => setComments((items) => [...items, comment])}
        submit={(content) => fetch('/api/comentarios', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, [target.kind === 'product' ? 'product_rating_id' : 'store_rating_id']: target.id }) })} />}
    </section>
  );
}
