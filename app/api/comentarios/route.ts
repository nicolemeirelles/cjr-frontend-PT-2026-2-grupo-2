import { NextResponse } from 'next/server';
import { isPositiveId } from '@/lib/comments';
import { forwardComments, readCommentBody } from '@/lib/comments-server';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const product = query.get('product_rating_id');
  const store = query.get('store_rating_id');
  const id = Number(product ?? store);
  if (!!product === !!store || !isPositiveId(id)) {
    return NextResponse.json({ message: 'Selecione uma avaliação.' }, { status: 400 });
  }
  return forwardComments(request, `/comentarios?${product ? 'product_rating_id' : 'store_rating_id'}=${id}`);
}

export async function POST(request: Request) {
  const body = await readCommentBody(request);
  const product = body?.product_rating_id;
  const store = body?.store_rating_id;
  if (!body || (product !== undefined) === (store !== undefined) || !isPositiveId(product ?? store)) {
    return NextResponse.json({ message: 'Informe um comentário de até 500 caracteres e uma avaliação.' }, { status: 400 });
  }
  return forwardComments(request, '/comentarios', {
    content: body.content,
    ...(product !== undefined ? { product_rating_id: product } : { store_rating_id: store }),
  });
}
