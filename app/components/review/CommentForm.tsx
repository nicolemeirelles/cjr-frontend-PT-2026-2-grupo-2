"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import "./review.css";

export default function CommentForm({
  reviewId,
  canComment,
}: {
  reviewId: number;
  canComment: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || pending) return;

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, store_rating_id: reviewId }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          data?.message ?? "Não foi possível comentar. Tente novamente.",
        );
        return;
      }
      setText("");
      router.refresh();
    } catch {
      setError("Sem conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          maxLength={500}
          disabled={!canComment}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            canComment ? "Adicionar comentário" : "Faça login para comentar"
          }
          aria-label="Adicionar comentário"
        />
        <button
          type="submit"
          aria-label="Enviar comentário"
          disabled={!canComment || pending || !text.trim()}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 3 3 10.5l7 3 3 7L21 3Z" />
            <path d="m10 13.5 4-4" />
          </svg>
        </button>
      </form>
      {error && (
        <p role="alert" className="review-error">
          {error}
        </p>
      )}
    </>
  );
}
