import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import { api } from '@/lib/axios-server';
import { isSameOrigin, SESSION_COOKIE } from '@/lib/auth';

const PRODUCTS_PATH = process.env.PRODUCTS_API_PATH ?? '/produtos';
const IMAGES_PATH = process.env.PRODUCT_IMAGES_API_PATH ?? '/imagens';
const MAX_IMAGES = 4;

type RouteContext = { params: Promise<{ id: string }> };
type ImageInput = { id?: number; url: string };

function backendError(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string | string[] }>(error) && error.response) {
    const { status, data } = error.response;
    if (status < 500) {
      return NextResponse.json({ message: data?.message ?? fallback }, { status });
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

async function checkRequest(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return { error: NextResponse.json({ message: 'Origem da solicitação inválida.' }, { status: 403 }) };
  }
  if (!(await cookies()).get(SESSION_COOKIE)?.value) {
    return { error: NextResponse.json({ message: 'Sua sessão expirou. Entre novamente.' }, { status: 401 }) };
  }
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) {
    return { error: NextResponse.json({ message: 'Produto inválido.' }, { status: 400 }) };
  }
  return { id };
}

function parseImages(value: unknown): ImageInput[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_IMAGES) return null;
  const images: ImageInput[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) return null;
    const { id, url } = item as { id?: unknown; url?: unknown };
    if (typeof url !== 'string' || !url) return null;
    if (id !== undefined && !Number.isInteger(id)) return null;
    images.push({ id: id as number | undefined, url });
  }
  return images;
}

export async function PATCH(request: Request, context: RouteContext) {
  const checked = await checkRequest(request, context);
  if ('error' in checked) return checked.error;
  const { id } = checked;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Dados do produto inválidos.' }, { status: 400 });
  }

  const images = parseImages(payload?.images);
  if (!payload || typeof payload !== 'object' || !images) {
    return NextResponse.json({ message: 'Dados do produto inválidos.' }, { status: 400 });
  }

  const { name, description, price, stock, category_id } = payload;
  try {
    await api.patch(`${PRODUCTS_PATH}/${id}`, { name, description, price, stock, category_id });
  } catch (error) {
    return backendError(error, 'Não foi possível salvar o produto.');
  }
  try {
    const { data } = await api.get(`${PRODUCTS_PATH}/${id}`);
    const current: { id: number }[] = Array.isArray(data?.images) ? data.images : [];
    const currentIds = new Set(current.map((image) => image.id));
    const keptIds = new Set(images.filter((image) => image.id !== undefined).map((image) => image.id));
    await Promise.all(
      current
        .filter((image) => !keptIds.has(image.id))
        .map((image) => api.delete(`${IMAGES_PATH}/${image.id}`)),
    );
    await Promise.all(
      images.map((image, order) =>
        image.id !== undefined && currentIds.has(image.id)
          ? api.patch(`${IMAGES_PATH}/${image.id}`, { order })
          : api.post(IMAGES_PATH, { image_url: image.url, order, product_id: id }),
      ),
    );
  } catch {
    return NextResponse.json(
      { message: 'O produto foi salvo, mas algumas fotos não foram atualizadas. Tente novamente.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ id }, { status: 200 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const checked = await checkRequest(request, context);
  if ('error' in checked) return checked.error;

  try {
    await api.delete(`${PRODUCTS_PATH}/${checked.id}`);
  } catch (error) {
    return backendError(error, 'Não foi possível deletar o produto.');
  }
  return new NextResponse(null, { status: 204 });
}