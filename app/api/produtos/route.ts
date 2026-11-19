import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import { api } from '@/lib/axios-server';
import { isSameOrigin, SESSION_COOKIE } from '@/lib/auth';

const PRODUCTS_PATH = process.env.PRODUCTS_API_PATH ?? '/produtos';
const IMAGES_PATH = process.env.PRODUCT_IMAGES_API_PATH ?? '/imagens';
const MAX_IMAGES = 4; 

function backendError(error: unknown) {
  if (isAxiosError<{ message?: string | string[] }>(error) && error.response) {
    const { status, data } = error.response;

    if (status < 500) {
      return NextResponse.json(
        { message: data?.message ?? 'Não foi possível criar o produto.' },
        { status },
      );
    }
    return NextResponse.json(
      { message: 'O serviço de produtos está indisponível. Tente novamente.' },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { message: 'Não foi possível conectar ao serviço de produtos. Tente novamente.' },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: 'Origem da solicitação inválida.' }, { status: 403 });
  }

  if (!(await cookies()).get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ message: 'Sua sessão expirou. Entre novamente.' }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Dados do produto inválidos.' }, { status: 400 });
  }

  const imageUrls: unknown = payload?.image_urls;
  if (
    !payload ||
    typeof payload !== 'object' ||
    !Array.isArray(imageUrls) ||
    imageUrls.length > MAX_IMAGES ||
    imageUrls.some((url) => typeof url !== 'string')
  ) {
    return NextResponse.json({ message: 'Dados do produto inválidos.' }, { status: 400 });
  }

  const { name, description, price, stock, category_id, store_id } = payload;
  const productData = { name, description, price, stock, category_id, store_id };

  let product: { id: number };
  try {
    const response = await api.post(PRODUCTS_PATH, productData);
    if (typeof response.data?.id !== 'number') {
      return NextResponse.json(
        { message: 'O serviço de produtos retornou uma resposta inválida.' },
        { status: 502 },
      );
    }
    product = response.data;
  } catch (error) {
    return backendError(error);
  }

  const imageResults = await Promise.allSettled(
    imageUrls.map((image_url, order) =>
      api.post(IMAGES_PATH, { image_url, order, product_id: product.id }),
    ),
  );

  if (imageResults.some((result) => result.status === 'rejected')) {
    await api.delete(`${PRODUCTS_PATH}/${product.id}`).catch(() => null);
    return NextResponse.json(
      { message: 'Não foi possível salvar as fotos do produto. Tente novamente.' },
      { status: 502 },
    );
  }

  return NextResponse.json(product, { status: 201 });
}