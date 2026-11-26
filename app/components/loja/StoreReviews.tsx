import Image from "next/image";
import Link from "next/link";
import type { StoreReview } from "@/lib/store";
import Stars from "./Stars";

export default function StoreReviews({
  averageRating,
  reviews,
}: {
  averageRating: number | null;
  reviews: StoreReview[];
}) {
  return (
    <section className="store-reviews" aria-labelledby="store-reviews-title">
      <h2 id="store-reviews-title">Reviews e Comentários</h2>
      {averageRating === null || reviews.length === 0 ? (
        <p className="store-empty">Esta loja ainda não tem avaliações.</p>
      ) : (
        <>
          <p className="store-average">{averageRating.toFixed(2)}</p>
          <Stars rating={averageRating} size={44} />
          <div
            className="store-review-row"
            role="region"
            aria-label="Avaliações da loja"
            tabIndex={0}
          >
            {reviews.map((review) => (
              <Link
                className="store-review"
                key={review.id}
                href={`/avaliacao/${review.id}`}
              >
                {review.authorPhoto ? (
                  <Image
                    className="store-review-avatar"
                    src={review.authorPhoto}
                    alt=""
                    width={110}
                    height={110}
                    unoptimized
                  />
                ) : (
                  <div className="store-review-avatar" aria-hidden="true">
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" />
                    </svg>
                  </div>
                )}
                <div className="store-review-body">
                  <div className="store-review-header">
                    <h3>{review.authorName}</h3>
                    <Stars rating={review.rating} size={22} />
                  </div>
                  {review.comment && <p>{review.comment}</p>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
