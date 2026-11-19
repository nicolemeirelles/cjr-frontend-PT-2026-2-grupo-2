import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendUrl, isSameOrigin, SESSION_COOKIE } from './auth';

export async function forwardComments(request: Request, path: string, body?: object) {
  const writing = request.method !== 'GET';
  if (writing && !isSameOrigin(request)) {
    return NextResponse.json({ message: 'Origem da solicitação inválida.' }, { status: 403 });
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (writing && !token) {
    return NextResponse.json({ message: 'Entre na sua conta para comentar.' }, { status: 401 });
  }
  try {
    const response = await fetch(backendUrl(path), {
      method: request.method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    if (!response.ok) {
      const messages: Record<number, string> = {
        400: 'Confira o comentário e a avaliação selecionada.',
        401: 'Sua sessão expirou. Entre novamente.',
        403: 'Você só pode editar seus próprios comentários.',
        404: 'O comentário ou a avaliação não foi encontrado.',
      };
      return NextResponse.json({ message: messages[response.status] ?? 'Não foi possível salvar o comentário.' },
        { status: response.status >= 500 ? 502 : response.status });
    }
    return NextResponse.json(data, { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'Não foi possível conectar ao servidor. Tente novamente.' }, { status: 503 });
  }
}

export async function readCommentBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
    const data = body as Record<string, unknown>;
    if (typeof data.content !== 'string' || !data.content.trim() || data.content.trim().length > 500) return null;
    return { ...data, content: data.content.trim() };
  } catch {
    return null;
  }
}
