import { NextResponse } from 'next/server';
import { isPositiveId } from '@/lib/comments';
import { forwardComments, readCommentBody } from '@/lib/comments-server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readCommentBody(request);
  if (!/^\d+$/.test(id) || !isPositiveId(Number(id)) || !body) {
    return NextResponse.json({ message: 'Informe um comentário válido de até 500 caracteres.' }, { status: 400 });
  }
  return forwardComments(request, `/comentarios/${Number(id)}`, { content: body.content });
}
