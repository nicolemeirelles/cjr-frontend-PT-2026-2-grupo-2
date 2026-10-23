import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'stockio_session';

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function backendUrl(path: string) {
  const baseUrl = process.env.API_URL ?? 'http://localhost:3001';
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

export function isSameOrigin(request: Request) {
  try {
    const origin = new URL(request.headers.get('origin') ?? '');
    const protocol = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '');
    return origin.host === request.headers.get('host') && origin.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}

export async function getCurrentUser(): Promise<
  | { status: 'authenticated'; user: { name: string; email: string } }
  | { status: 'unauthenticated' | 'unavailable' }
> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return { status: 'unauthenticated' };

  try {
    const response = await fetch(backendUrl('/me'), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 401) return { status: 'unauthenticated' };
    if (!response.ok) return { status: 'unavailable' };

    const user = await response.json();
    if (typeof user.name !== 'string' || typeof user.email !== 'string') {
      return { status: 'unavailable' };
    }

    return { status: 'authenticated', user: { name: user.name, email: user.email } };
  } catch {
    return { status: 'unavailable' };
  }
}
