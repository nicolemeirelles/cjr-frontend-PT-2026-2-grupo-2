import Image from "next/image";
import Link from "next/link";

export default function Navbar({
  authenticated = false,
  demo = false,
}: {
  authenticated?: boolean;
  demo?: boolean;
}) {
  const estiloIcone = "text-white transition-colors hover:text-[#6B35F5]";

  return (
    <header>
      <nav
        aria-label="Navegação principal"
        className="flex h-16 items-center justify-between bg-black px-20"
      >
        <Link href={demo ? "/?demo=1" : "/"} aria-label="Stock.io — início">
          <Image src="/Stock.io.svg" alt="Stock.io" width={160} height={40} />
        </Link>

        <div className="flex items-center gap-6">
          {/* Categorias */}
          <Link
            href={demo ? "/?demo=1#categorias" : "/#categorias"}
            aria-label="Explorar categorias"
            className={estiloIcone}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </Link>

          {/* Lojas */}
          <Link
            href={
              demo ? "/?demo=1&view=lojas#produtos" : "/?view=lojas#produtos"
            }
            aria-label="Explorar lojas"
            className={estiloIcone}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9 4.5 4h15L21 9" />
              <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
              <path d="M5 12v8h14v-8" />
              <path d="M10 20v-5h4v5" />
            </svg>
          </Link>

          {authenticated ? (
            <>
              <Link href="/perfil" aria-label="Perfil" className={estiloIcone}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" />
                </svg>
              </Link>

              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  aria-label="Sair"
                  className="cursor-pointer text-white transition-colors hover:text-red-500"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-white transition-colors hover:text-[#6B35F5]"
              >
                LOGIN
              </Link>
              <Link
                href="/cadastro"
                className="rounded-full bg-[#6B35F5] px-4 py-1 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#6B35F5]"
              >
                CADASTRE-SE
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
