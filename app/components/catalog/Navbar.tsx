import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import './catalog.css';
export default function Navbar({
  authenticated,
  demo,
  active,
}: {
  authenticated: boolean;
  demo: boolean;
  active?: 'perfil';
}) {
  return (
    <header className="catalog-navbar">
      <Link
        href={demo ? '/?demo=1' : '/'}
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
          href={demo ? '/?demo=1#categorias' : '/#categorias'}
          aria-label="Explorar categorias"
        >
          <Icon name="bag" />
        </Link>
        <Link
          href={demo ? '/?demo=1&view=lojas#produtos' : '/?view=lojas#produtos'}
          aria-label="Explorar lojas"
        >
          <Icon name="store" />
        </Link>
        {authenticated ? (
          <>
            <Link
              href="/perfil"
              aria-label="Meu perfil"
              aria-current={active === 'perfil' ? 'page' : undefined}
            >
              <Icon name="user" />
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" aria-label="Sair">
                <Icon name="logout" />
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
