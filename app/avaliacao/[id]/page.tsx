import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { League_Spartan } from "next/font/google";
import Navbar from "@/app/components/catalog/Navbar";
import CommentForm from "@/app/components/review/CommentForm";
import ReviewModal from "@/app/components/review/ReviewModal";
import { getCurrentUser } from "@/lib/auth";
import { getReviewPage } from "@/lib/reviews/api";
import { timeAgo } from "@/lib/reviews/format";
import "../avaliacao.css";

const leagueSpartan = League_Spartan({ subsets: ["latin"], display: "swap" });

function Avatar({
  name,
  src,
  size,
}: {
  name: string;
  src?: string | null;
  size: number;
}) {
  return src ? (
    <Image
      className="review-avatar"
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
    />
  ) : (
    <span
      className="review-avatar review-avatar-fallback"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="review-stars" role="img" aria-label={`Nota ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill={n <= value ? "#ffe34d" : "none"}
          stroke="#ffe34d"
          strokeWidth="1"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.6 6 20.9l1.3-6.7-5-4.7 6.8-.8z" />
        </svg>
      ))}
    </span>
  );
}

async function ReviewContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const [session, result] = await Promise.all([
    getCurrentUser(),
    getReviewPage(Number(id)),
  ]);
  if (result.status === "not-found") notFound();

  const authenticated = session.status === "authenticated";
  const shell = (children: React.ReactNode) => (
    <div className={`catalog-page review-page ${leagueSpartan.className}`}>
      <Navbar authenticated={authenticated} demo={!authenticated} />
      <main>{children}</main>
    </div>
  );

  if (result.status === "unavailable") {
    return shell(
      <p role="status" className="review-demo-note" style={{ padding: 32 }}>
        Não foi possível carregar a avaliação agora. Tente novamente em
        instantes.
      </p>,
    );
  }

  const { review, store } = result;
  const isAuthor =
    session.status === "authenticated" && session.user.id === review.user.id;

  return shell(
    <>
      <section className="review-hero" aria-labelledby="review-author">
        <Link href="/" aria-label="Voltar" className="review-back">
          <svg
            width="18"
            height="30"
            viewBox="0 0 35 54"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M31 3 5 27l26 24" />
          </svg>
        </Link>

        <div className="review-hero-body">
          <header className="review-hero-head">
            <Avatar
              name={review.user.name}
              src={review.user.profile_picture_url}
              size={40}
            />
            <h1 id="review-author">{review.user.name}</h1>
            <span className="review-time">{timeAgo(review.createdAt)}</span>
            <Stars value={review.rating} />
          </header>
          {review.comment && <p className="review-text">{review.comment}</p>}
        </div>

        {isAuthor && (
          <ReviewModal
            targetId={store.id}
            targetName={store.name}
            review={{
              id: review.id,
              rating: review.rating,
              comment: review.comment,
            }}
          />
        )}
      </section>

      <section className="review-thread" aria-label="Comentários">
        {review.ratingComments.length > 0 ? (
          <ul className="review-comment-list">
            {review.ratingComments.map((c) => (
              <li key={c.id} className="review-comment">
                <Avatar
                  name={c.user.name}
                  src={c.user.profile_picture_url}
                  size={30}
                />
                <div>
                  <p className="review-comment-author">
                    <strong>{c.user.name}</strong>
                    <span className="review-time">{timeAgo(c.createdAt)}</span>
                  </p>
                  {c.user.id === store.user.id && (
                    <p className="review-owner">dono da loja</p>
                  )}
                  <p className="review-comment-text">{c.content}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="review-no-comments">Ainda não há comentários.</p>
        )}
        <CommentForm reviewId={review.id} canComment={authenticated} />
      </section>
    </>,
  );
}

export default function Avaliacao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center">
          Carregando avaliação...
        </p>
      }
    >
      <ReviewContent params={params} />
    </Suspense>
  );
}
