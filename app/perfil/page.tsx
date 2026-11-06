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
const produtos: Product[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  name: `Produto ${index + 1}`,
  price: index + 1.99,
  image: '',
  stock: index % 2 === 0 ? 1 : 0,
  storeName: 'CJR',
  categoryId: 1,
  storeLogo: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  rating: null,
}));

async function ProfileContent() {
  const session = await getCurrentUser();
  const authenticated = session.status === 'authenticated';
  return (
    <div className={`catalog-page profile-page ${leagueSpartan.className}`}>
      <Navbar authenticated={authenticated} demo={false} active="perfil" />
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
            <h1 id="profile-name">
              {authenticated ? session.user.name : 'Nome do Usuário'}
            </h1>
            <p className="profile-username">@ Nome de Perfil</p>
            <p className="profile-email">
              <Image src="/email.svg" alt="" width={21} height={17} />
              <span>
                {authenticated ? session.user.email : 'Email do Usuário'}
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
          <p className="profile-demo-note">
            Produtos de demonstração do layout.
          </p>
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
        </section>
      </main>
    </div>
  );
}

export default function Perfil() {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center">
          Carregando perfil...
        </p>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
