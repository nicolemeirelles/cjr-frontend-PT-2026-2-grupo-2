'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { League_Spartan } from 'next/font/google';
import './login.css';

const leagueSpartan = League_Spartan({ subsets: ['latin'], display: 'swap' });

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError('');
    setNotice('');

    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Informe um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(typeof data.message === 'string' ? data.message : 'Não foi possível entrar. Tente novamente.');
        return;
      }
      setPassword('');
      router.replace('/conta');
      router.refresh();
    } catch {
      setError('Não foi possível conectar ao serviço de login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`${leagueSpartan.className} login-page min-h-dvh bg-[#f6f3e4] text-[#171918]`}>
      <div className="login-layout mx-auto grid min-h-dvh max-w-[1440px] grid-cols-1 grid-rows-[auto_1fr] gap-8 px-6 pt-8">
        <section aria-label="Stock.io" className="flex flex-col items-center lg:items-start">
          <div className="login-logoFrame relative h-20 w-64 overflow-hidden">
            <Image src="/logo.svg" alt="Stock.io" width={421} height={222} priority className="login-logo absolute bottom-0 h-auto w-full" />
          </div>
          <Image src="/mascote-login.svg" alt="" width={514} height={802} priority className="login-mascot hidden" />
        </section>

        <section aria-labelledby="login-title" className="login-panel min-w-0 rounded-t-[48px] bg-[#171918] px-6 py-14 text-[#f6f3e4]">
          <h1 id="login-title" className="login-title m-0 text-center font-extrabold leading-none">BEM VINDO DE VOLTA!</h1>

          <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="login-form flex flex-col">
            <div>
              <label htmlFor="email" className="sr-only">E-mail</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} aria-describedby={error ? 'login-error' : undefined} className="login-input block h-12 w-full rounded-full border-0 bg-[#f6f3e4] px-6 text-xl font-light text-[#171918] placeholder:text-[#858585] placeholder:opacity-100 disabled:opacity-70" />
            </div>

            <div className="login-passwordField relative">
              <label htmlFor="password" className="sr-only">Senha</label>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} aria-describedby={error ? 'login-error' : undefined} className="login-input block h-12 w-full rounded-full border-0 bg-[#f6f3e4] px-6 text-xl font-light text-[#171918] placeholder:text-[#858585] placeholder:opacity-100 disabled:opacity-70" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} className="login-passwordToggle">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="m3 3 18 18" />}
                </svg>
              </button>
            </div>

            <button type="button" onClick={() => { setError(''); setNotice('A recuperação de senha ainda não está disponível.'); }} className="login-forgotPassword">Esqueceu sua senha?</button>

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>

            <p className="login-signup">Não possui uma conta? <Link href="/cadastro">Cadastre-se</Link></p>
            {error && <p id="login-error" role="alert" className="login-error">{error}</p>}
            {notice && <p role="status" className="login-notice">{notice}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
