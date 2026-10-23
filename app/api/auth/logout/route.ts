import { NextResponse } from 'next/server';
import { isSameOrigin, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: 'Origem da solicitação inválida.' }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL('/login', request.headers.get('origin')!), 303);
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
