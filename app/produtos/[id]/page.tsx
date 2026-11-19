import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { League_Spartan } from 'next/font/google';
import Navbar from '@/app/components/catalog/Navbar';
import ProductCard from '@/app/components/catalog/ProductCard';
import ProductGallery from '@/app/components/catalog/produto/ProductGallery';
import { getCurrentUser } from '@/lib/auth';
import { getProductDetail, type ProductReview } from '@/lib/catalog/product-detail';
import { getCatalog } from '@/lib/catalog/api';
import { buildCategoryOptions, type CategoryOption } from '@/lib/catalog/category-options';
import EditProductButton from '@/app/components/catalog/EditProductButton';
import './produto.css';

const leagueSpartan = League_Spartan({ subsets: ['latin'], display: 'swap' });
const formatPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
type ProductParams = { id: string };
async function ProductContent({ params }: { params: Promise<ProductParams> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) notFound();

  const session = await getCurrentUser();
  const authenticated = session.status === 'authenticated';
  const result = await getProductDetail(productId, authenticated ? session.user.id : null);

  if (result.status === 'not-found') notFound();

  const isOwner = result.status === 'success' && result.product.isOwner;
  const catalog = isOwner ? await getCatalog() : null;
  const categoryOptions =
    result.status === 'success' && catalog?.source === 'api'
      ? buildCategoryOptions(catalog.categories, result.product.categoryId)
      : [];

  return (
    <div className={`catalog-page product-page ${leagueSpartan.className}`}>
      <Navbar authenticated={authenticated} demo={false} />

      <main className="product-main">
        <Link href="/" aria-label="Voltar para a Home" className="product-back">
          <svg width="22" height="34" viewBox="0 0 35 54" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M31 3 5 27l26 24" />
          </svg>
        </Link>

        {result.status === 'unavailable' ? (
          <p role="status" className="product-status">
            Não foi possível carregar o produto. Tente novamente em instantes.
          </p>
        ) : (
          <ProductView product={result.product} categoryOptions={categoryOptions} />
        )}
      </main>
    </div>
  );
}

type ProductViewProps = {
  product: Extract<Awaited<ReturnType<typeof getProductDetail>>, { status: 'success' }>['product'];
  categoryOptions: CategoryOption[];
};

function ProductView({ product, categoryOptions }: ProductViewProps) {
  const available = product.stock > 0;

  return (
    <>
      <section className="product-hero" aria-labelledby="product-name">
        <ProductGallery
          images={product.images}
          productName={product.name}
          storeName={product.storeName}
          storeLogo={product.storeLogo}
        />

        <div className="product-info">
          <div className="product-title-row">
            <h1 id="product-name">{product.name}</h1>
            {product.isOwner && (
              <EditProductButton
                product={{
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  stock: product.stock,
                  categoryId: product.categoryId,
                  images: product.imageItems,
                }}
                categories={categoryOptions}
              />
            )}
          </div>

          <p className="product-meta">
            <span className="product-rating">
              {product.rating ? (
                <>
                  <span aria-hidden="true" className="product-star">★</span>
                  {product.rating.average.toFixed(1)} | {product.rating.count}{' '}
                  {product.rating.count === 1 ? 'review' : 'reviews'}
                </>
              ) : (
                'Sem avaliações'
              )}
            </span>
            {product.categoryName && <span className="product-category">{product.categoryName}</span>}
            <span className={available ? 'product-stock' : 'product-stock product-stock--out'}>
              {available ? `${product.stock} ${product.stock === 1 ? 'disponível' : 'disponíveis'}` : 'Indisponível'}
            </span>
          </p>

          <p className="product-price">{formatPrice.format(product.price)}</p>

          <h2 className="product-description-title">Descrição</h2>
          <p className="product-description">
            {product.description || 'Este produto ainda não tem descrição.'}
          </p>
        </div>
      </section>

      <section className="product-reviews" aria-labelledby="reviews-title">
        <h2 id="reviews-title">Avaliações</h2>
        {product.reviews.length === 0 ? (
          <p className="product-reviews__empty">Este produto ainda não tem avaliações.</p>
        ) : (
          <ul className="product-reviews__row" aria-label="Avaliações do produto" tabIndex={0}>
            {product.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ul>
        )}
      </section>

      {product.sameStore.length > 0 && (
        <section className="product-same-store" aria-labelledby="same-store-title">
          <h2 id="same-store-title">Da mesma loja</h2>
          <div className="product-same-store__row" role="region" aria-label="Outros produtos da loja" tabIndex={0}>
            {product.sameStore.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <li className="review-card">
      {review.userPhoto ? (
        <Image
          src={review.userPhoto}
          alt=""
          width={95}
          height={95}
          className="review-card__avatar"
          unoptimized
        />
      ) : (
        <span className="review-card__avatar review-card__avatar--empty" aria-hidden="true">
          {review.userName.charAt(0).toUpperCase()}
        </span>
      )}

      <div className="review-card__body">
        <div className="review-card__header">
          <h3>{review.userName}</h3>
          <Stars rating={review.rating} />
        </div>
        {review.comment && <p className="review-card__comment">{review.comment}</p>}
      </div>
    </li>
  );
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="review-stars" role="img" aria-label={`Nota ${filled} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} aria-hidden="true" className={star <= filled ? 'review-stars__on' : 'review-stars__off'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProdutoPage({ params }: { params: Promise<ProductParams> }) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center">
          Carregando produto...
        </p>
      }
    >
      <ProductContent params={params} />
    </Suspense>
  );
}