import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { League_Spartan } from "next/font/google";
import ProductCard from "@/app/components/catalog/ProductCard";
import Navbar from "@/app/components/catalog/Navbar";
import { getCurrentUser } from "@/lib/auth";
import "./perfil.css";
import { getUserProducts } from "@/lib/catalog/user-products";
import { getCatalog } from "@/lib/catalog/api";
import EditProfileButton from "@/app/components/perfil/EditProfileButton";
import AddStoreButton from "@/app/components/loja/AddStoreButton";

const leagueSpartan = League_Spartan({ subsets: ["latin"], display: "swap" });
async function ProfileContent() {
  const session = await getCurrentUser();
  const authenticated = session.status === "authenticated";

  const photoUrl = authenticated ? session.user.profile_picture_url : null;
  const resultado = authenticated
    ? await getUserProducts(session.user.id)
    : { status: "success" as const, products: [] };
  
  const canLoadStore = authenticated;
  const catalog = canLoadStore ? await getCatalog() : null;
  const apiCategories = catalog?.source === "api" ? catalog.categories : [];
  
  const storeCategories = apiCategories
    .filter((category) => category.parentId === null)
    .map(({ id, name }) => ({ id, name }));

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
            {photoUrl ? (
              <Image
                className="profile-avatar"
                src={photoUrl}
                alt="Foto de perfil"
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
              {authenticated ? session.user.name : "Visitante"}
            </h1>
            <p className="profile-username">
              @{" "}
              {authenticated ? session.user.username : "Entre na sua conta"}
            </p>
            <p className="profile-email">
              <Image src="/email.svg" alt="" width={21} height={17} />
              <span>
                {authenticated ? session.user.email : ""}
              </span>
            </p>
          </div>
          {authenticated && (
            <div className="profile-buttons">
              <EditProfileButton user={session.user} />
              <AddStoreButton categories={storeCategories} />
            </div>
          )}
        </section>
        <section
          className="profile-products"
          aria-labelledby="profile-products-title"
        >
          <div className="profile-products-heading">
            <h2 id="profile-products-title">Produtos</h2>
            <div className="profile-products-actions">
              <Link href="/#produtos">ver mais</Link>
            </div>
          </div>
          {session.status === "unavailable" && (
            <p role="status" className="profile-demo-note">
              Não foi possível verificar sua sessão. Tente novamente em
              instantes.
            </p>
          )}
          {!authenticated ? (
            <p className="profile-demo-note"><Link href="/login">Entre na sua conta para visualizar seus produtos.</Link></p>
          ) : resultado.status === "unavailable" ? (
            <p role="status" className="profile-demo-note">
              Não foi possível carregar seus produtos. Tente novamente em
              instantes.
            </p>
          ) : resultado.products.length === 0 ? (
            <p className="profile-demo-note">Nenhum produto cadastrado.</p>
          ) : (
            <div
              className="profile-product-row"
              role="region"
              aria-label="Seus produtos"
              tabIndex={0}
            >
              {resultado.products.map((produto) => (
                <ProductCard key={produto.id} product={produto} />
              ))}
            </div>
          )}
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
