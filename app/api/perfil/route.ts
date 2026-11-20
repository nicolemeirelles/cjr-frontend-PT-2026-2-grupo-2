import { NextResponse } from 'next/server';
import { api } from '@/lib/axios-server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';
import { checkRequest, errorResponse, readBody } from '@/lib/api-route';

const PROFILE_FIELDS = ['name', 'username', 'email', 'profile_picture_url'] as const;

export async function PATCH(request: Request) {
  const blocked = await checkRequest(request);
  if (blocked) return blocked;

  const body = await readBody(request);
  if (!body) {
    return NextResponse.json({ message: 'Dados do perfil inválidos.' }, { status: 400 });
  }

  const data: Record<string, string> = {};
  for (const field of PROFILE_FIELDS) {
    const value = body[field];
    if (typeof value === 'string' && value.trim()) data[field] = value.trim();
  }

  try {
    const { data: me } = await api.get('/me');
    const { data: user } = await api.patch(`/users/${me.id}`, data);
    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error, 'Não foi possível salvar o perfil. Tente novamente.');
  }
}

export async function DELETE(request: Request) {
  const blocked = await checkRequest(request);
  if (blocked) return blocked;

  try {
    const { data: me } = await api.get('/me');
    await api.delete(`/users/${me.id}`);
  } catch (error) {
    return errorResponse(error, 'Não foi possível deletar a conta. Tente novamente.');
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
}