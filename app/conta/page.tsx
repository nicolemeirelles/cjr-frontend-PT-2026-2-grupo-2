import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

async function AccountContent() {
  const session = await getCurrentUser();
  if (session.status === 'unauthenticated') redirect('/login');

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f5f3e3] px-6 text-[#171a17]">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-sm">
        {session.status === 'authenticated' ? (
          <>
            <p className="mb-3 text-sm font-semibold text-[#6024d5]" role="status">Login realizado com sucesso</p>
            <h1 className="text-3xl font-bold">Olá, {session.user.name}!</h1>
            <p className="mt-3 break-all">{session.user.email}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Não foi possível carregar sua conta</h1>
            <p className="mt-3">O serviço está indisponível. Tente novamente em instantes.</p>
            <Link href="/conta" className="mt-4 inline-block text-[#6024d5] underline">Tentar novamente</Link>
          </>
        )}
        <form action="/api/auth/logout" method="post" className="mt-8">
          <button className="rounded-full bg-[#7135f5] px-8 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6024d5]">Sair</button>
        </form>
      </section>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<p role="status" className="p-8 text-center">Carregando sua conta...</p>}>
      <AccountContent />
    </Suspense>
  );
}
