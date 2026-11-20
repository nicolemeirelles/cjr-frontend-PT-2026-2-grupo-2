import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import { isSameOrigin, SESSION_COOKIE } from '@/lib/auth';

export async function checkRequest(request: Request): Promise<NextResponse | null> {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: 'Origem da solicitação inválida.' }, { status: 403 });
  }
  if (!(await cookies()).get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ message: 'Sua sessão expirou. Entre novamente.' }, { status: 401 });
  }
  return null;
}

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return typeof body === 'object' && body !== null ? body : null;
  } catch {
    return null;
  }
}

export function errorResponse(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string | string[] }>(error) && error.response) {
    const { status, data } = error.response;
    if (status < 500) {
      return NextResponse.json({ message: data?.message ?? fallback }, { status });
    }
    return NextResponse.json({ message: fallback }, { status: 502 });
  }
  return NextResponse.json(
    { message: 'Não foi possível conectar ao servidor. Tente novamente.' },
    { status: 503 },
  );
}