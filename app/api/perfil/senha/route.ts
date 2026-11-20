import { NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import { api } from '@/lib/axios-server';
import { checkRequest, errorResponse, readBody } from '@/lib/api-route';

const MIN_LENGTH = 6; 

export async function PATCH(request: Request) {
  const blocked = await checkRequest(request);
  if (blocked) return blocked;

  const body = await readBody(request);
  const oldPassword = body?.oldPassword;
  const newPassword = body?.newPassword;
  const confirmPassword = body?.confirmPassword;

  if (typeof oldPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    return NextResponse.json({ message: 'Preencha os três campos.' }, { status: 400 });
  }
  if (newPassword.length < MIN_LENGTH) {
    return NextResponse.json({ message: `A nova senha deve ter pelo menos ${MIN_LENGTH} caracteres.` }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ message: 'A confirmação não é igual à nova senha.' }, { status: 400 });
  }
  if (newPassword === oldPassword) {
    return NextResponse.json({ message: 'A nova senha deve ser diferente da antiga.' }, { status: 400 });
  }

  try {
    const { data: me } = await api.get('/me');

 try {
      await api.post('/login', { email: me.email, password: oldPassword });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return NextResponse.json({ message: 'A senha antiga está incorreta.' }, { status: 400 });
      }
      throw error;
    }

    // 2) troca a senha
    await api.patch(`/users/${me.id}`, { password: newPassword, confirmPassword });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, 'Não foi possível alterar a senha. Tente novamente.');
  }
}