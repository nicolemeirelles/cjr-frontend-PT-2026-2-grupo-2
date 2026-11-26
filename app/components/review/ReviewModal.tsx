"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";
import "./review.css";

type Props = {
  /** "store" (padrão) avalia a loja; "product" avalia o produto. */
  kind?: "store" | "product";
  targetId: number;
  targetName: string;
  /** Se vier, o modal funciona em modo edição (Salvar / Deletar). */
  review?: { id: number; rating: number; comment: string | null };
  /** Só para loja: para onde ir depois de deletar. */
  afterDeleteHref?: string;
};

export default function ReviewModal({
  kind = "store",
  targetId,
  targetName,
  review,
  afterDeleteHref = "/",
}: Props) {
  const router = useRouter();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [text, setText] = useState(review?.comment ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isProduct = kind === "product";
  const apiBase = isProduct ? "/api/avaliacoes-produto" : "/api/avaliacoes";
  const idField = isProduct ? "product_id" : "store_id";
  const triggerLabel = isProduct ? "Avaliar produto" : "Avaliar loja";
  const fieldLabel = isProduct ? "Avaliação do produto" : "Avaliação da loja";

  function open() {
    setRating(review?.rating ?? 0);
    setText(review?.comment ?? "");
    setError(null);
    setConfirmDelete(false);
    dialogRef.current?.showModal();
  }
  const close = () => dialogRef.current?.close();

  async function send(url: string, method: string, body?: unknown) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(
          data?.message ?? "Não foi possível concluir. Tente novamente.",
        );
        return null;
      }
      return data ?? {};
    } catch {
      setError("Sem conexão. Tente novamente.");
      return null;
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rating) {
      setError("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    const payload = { rating, comment: text };

    if (review) {
      const saved = await send(`${apiBase}/${review.id}`, "PATCH", payload);
      if (!saved) return;
      close();
      router.refresh();
    } else {
      const created = await send(apiBase, "POST", {
        ...payload,
        [idField]: targetId,
      });
      if (!created) return;
      close();
      if (isProduct) {
        setRating(0);
        setText("");
        router.refresh();
      } else {
        router.push(`/avaliacao/${created.id}`);
      }
    }
  }

  async function handleDelete() {
    if (!review) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const deleted = await send(`${apiBase}/${review.id}`, "DELETE");
    if (!deleted) return;
    close();
    if (isProduct) router.refresh();
    else router.push(afterDeleteHref);
  }

  return (
    <>
      {review ? (
        <button
          type="button"
          className="review-edit"
          aria-label="Editar avaliação"
          onClick={open}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      ) : (
        <button type="button" className="review-trigger" onClick={open}>
          {triggerLabel}
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="review-modal"
        aria-labelledby={titleId}
        onClose={() => setConfirmDelete(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <form onSubmit={handleSubmit}>
          <button
            type="button"
            className="review-close"
            aria-label="Fechar"
            onClick={close}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 4l16 16M20 4 4 20" />
            </svg>
          </button>

          <h2 id={titleId}>
            Você está avaliando <strong>{targetName}</strong>
          </h2>

          <StarRating
            value={rating}
            onChange={(n) => {
              setRating(n);
              setError(null);
            }}
          />

          <textarea
            placeholder={fieldLabel}
            aria-label={fieldLabel}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {error && (
            <p role="alert" className="review-error">
              {error}
            </p>
          )}

          <div className="review-actions">
            {review && (
              <button
                type="button"
                className="review-delete"
                disabled={pending}
                onClick={handleDelete}
              >
                {confirmDelete ? "CONFIRMAR EXCLUSÃO" : "DELETAR"}
              </button>
            )}
            <button type="submit" className="review-submit" disabled={pending}>
              {pending ? "Enviando..." : review ? "Salvar" : "Avaliar"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
