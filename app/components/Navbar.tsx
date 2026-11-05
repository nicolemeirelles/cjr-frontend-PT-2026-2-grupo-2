import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const logado = false;

  return (
    <nav className="flex h-16 items-center justify-between bg-black px-20">
      <Link href="/">
        <Image src="/Stock.io.svg" alt="Stock.io" width={160} height={40} />
      </Link>

      <div className="flex items-center gap-6">
        {logado ? (
          <>
            <Link
              href="/perfil"
              aria-label="Perfil"
              className="text-white transition-colors hover:text-[#6B35F5]"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" />
              </svg>
            </Link>
            <button
              aria-label="Sair"
              className="text-white transition-colors hover:text-red-500"
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
  );
}
