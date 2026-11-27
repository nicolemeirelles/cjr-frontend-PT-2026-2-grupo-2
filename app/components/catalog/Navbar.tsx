import Link from 'next/link';
import Image from 'next/image';
import NavIcon from './NavIcon';
import './catalog.css';
export default function Navbar({
  authenticated,
  active,
}: {
  authenticated: boolean;
  demo: boolean;
  active?: 'perfil' | 'lojas';
}) {
  return (
    <header className="catalog-navbar">
      <Link
        href="/"
        aria-label="Stock.io — início"
        className="catalog-logo"
      >
        <Image
          src="/catalogo/logo-clara.svg"
          alt="Stock.io"
          width={220}
          height={43}
          unoptimized
        />
      </Link>
      <nav aria-label="Navegação principal" className="catalog-navlinks">
        <Link
          href="/#categorias"
          aria-label="Explorar categorias"
        >
          <NavIcon name="bag" />
        </Link>
        <Link
          href="/lojas"
          aria-label="Explorar lojas"
          aria-current={active === 'lojas' ? 'page' : undefined}
        >
          <NavIcon name="store" />
        </Link>
        {authenticated ? (
          <>
            <Link
              href="/perfil"
              aria-label="Meu perfil"
              aria-current={active === 'perfil' ? 'page' : undefined}
            >
              <NavIcon name="user" />
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" aria-label="Sair">
                <NavIcon name="logout" />
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="catalog-login-link">
              LOGIN
            </Link>
            <Link href="/cadastro" className="catalog-signup-link">
              CADASTRE-SE
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
