import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { League_Spartan } from 'next/font/google';
import ProductCard from '@/app/components/catalog/ProductCard';
import Navbar from '@/app/components/catalog/Navbar';
import { getCurrentUser } from '@/lib/auth';
import type { Product } from '@/lib/catalog/types';
import './perfil.css';

const leagueSpartan = League_Spartan({ subsets: ['latin'], display: 'swap' });
const produtos: Product[] = [
  { name: 'Bronzer', price: 254.99, image: 'bronzer', stock: 1 },
  { name: 'Blush', price: 199.99, image: 'blush', stock: 0 },
  { name: 'Perfume Rare', price: 599.9, image: 'perfume', stock: 1 },
  { name: 'Iluminador', price: 249.9, image: 'iluminador', stock: 1 },
  { name: 'Mini Blush', price: 99.99, image: 'mini-blush', stock: 0 },
].map((produto, index) => ({
  id: index + 1,
  name: produto.name,
  price: produto.price,
  image: `/perfil/${produto.image}.webp`,
  stock: produto.stock,
  storeName: 'Rare Beauty',
  categoryId: 1,
  storeLogo: '/perfil/marca.webp',
  createdAt: '2026-01-01T00:00:00.000Z',
  rating: null,
}));

type ProfileSearch = { demo?: string };

async function ProfileContent({
  searchParams,
}: {
  searchParams: Promise<ProfileSearch>;
}) {
  const search = await searchParams;
  const session = await getCurrentUser();
  const authenticated = session.status === 'authenticated';
  const demo = search.demo === '1' || !authenticated;
  return (
    <div className={`catalog-page profile-page ${leagueSpartan.className}`}>
      <Navbar authenticated={authenticated} demo={demo} active="perfil" />
      <main>
        <div className="profile-banner">
          <Link
            href="/"
            aria-label="Voltar para a Home"
            className="profile-back"
          >
            <svg
              width="35"
              height="54"
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
        </div>
        <section className="profile-details" aria-labelledby="profile-name">
          <div className="profile-user">
            {demo ? (
              <Image
                className="profile-avatar"
                src="/perfil/avatar.webp"
                alt="Selena Gomez, perfil de demonstração"
                width={230}
                height={230}
                unoptimized
                priority
              />
            ) : (
              <div
                className="profile-avatar"
                role="img"
                aria-label="Usuário sem foto de perfil"
              >
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" />
                </svg>
              </div>
            )}
            <h1 id="profile-name">
              {demo
                ? 'Selena Gomez'
                : authenticated
                  ? session.user.name
                  : 'Nome do Usuário'}
            </h1>
            <p className="profile-username">
              @ {demo ? 'selenagomez' : 'Nome de Perfil'}
            </p>
            <p className="profile-email">
              <Image src="/email.svg" alt="" width={21} height={17} />
              <span>
                {demo
                  ? 'selenamariegomez@rare.com'
                  : authenticated
                    ? session.user.email
                    : 'Email do Usuário'}
              </span>
            </p>
          </div>
          {authenticated && (
            <button
              className="profile-edit"
              disabled
              title="A edição de perfil ainda não está disponível"
            >
              Editar Perfil
            </button>
          )}
        </section>
        <section
          className="profile-products"
          aria-labelledby="profile-products-title"
        >
          <div className="profile-products-heading">
            <h2 id="profile-products-title">Produtos</h2>
            <Link href="/#produtos">ver mais</Link>
          </div>
          {session.status === 'unavailable' && (
            <p role="status" className="profile-demo-note">
              Não foi possível verificar sua sessão. Tente novamente em
              instantes.
            </p>
          )}
          <div
            className="profile-product-row"
            role="region"
            aria-label="Produtos de demonstração"
            tabIndex={0}
          >
            {produtos.map((produto) => (
              <ProductCard key={produto.id} product={produto} />
            ))}
          </div>
          <p className="profile-demo-note">
            {demo
              ? 'Perfil e produtos de demonstração do protótipo.'
              : 'Produtos de demonstração do layout.'}
          </p>
        </section>
      </main>
    </div>
  );
}

export default function Perfil({
  searchParams,
}: {
  searchParams: Promise<ProfileSearch>;
}) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center">
          Carregando perfil...
        </p>
      }
    >
      <ProfileContent searchParams={searchParams} />
    </Suspense>
  );
}
