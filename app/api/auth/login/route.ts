import { NextResponse } from 'next/server';
import { backendUrl, isSameOrigin, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: 'Origem da solicitação inválida.' }, { status: 403 });
  }

  let credentials;
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ message: 'Dados de login inválidos.' }, { status: 400 });
  }

  if (
    !credentials ||
    typeof credentials.email !== 'string' ||
    typeof credentials.password !== 'string' ||
    !credentials.email.trim() ||
    !credentials.password
  ) {
    return NextResponse.json({ message: 'Preencha o e-mail e a senha.' }, { status: 400 });
  }

  try {
    const response = await fetch(backendUrl('/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email.trim(), password: credentials.password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const status = response.status === 401 ? 401 : response.status === 400 ? 400 : 502;
      const message = status === 401
        ? 'E-mail ou senha incorretos.'
        : status === 400
          ? 'Verifique o e-mail e a senha informados.'
          : 'O serviço de login está indisponível. Tente novamente.';
      return NextResponse.json({ message }, { status });
    }

    const data = await response.json();
    if (typeof data.access_token !== 'string' || !data.access_token) {
      return NextResponse.json({ message: 'O serviço de login retornou uma resposta inválida.' }, { status: 502 });
    }

    const result = NextResponse.json({ message: 'Login realizado com sucesso.' });
    result.headers.set('Cache-Control', 'no-store');
    result.cookies.set(SESSION_COOKIE, data.access_token, sessionCookieOptions);
    return result;
  } catch {
    return NextResponse.json({ message: 'Não foi possível conectar ao serviço de login. Tente novamente.' }, { status: 503 });
  }
}
