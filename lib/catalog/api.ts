import 'server-only';
import { cookies } from 'next/headers';
import { backendUrl, SESSION_COOKIE } from '@/lib/auth';
import type { CatalogData, Category, Product } from './types';
type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Resposta inválida');
  return value as RecordValue;
}
function number(value: unknown): number {
  if (typeof value !== 'number' && typeof value !== 'string')
    throw new Error('Número inválido');
  if (value === '') throw new Error('Número vazio');
  const result = Number(value);
  if (!Number.isFinite(result)) throw new Error('Número inválido');
  return result;
}
function name(value: unknown): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error('Nome inválido');
  return value.trim();
}
function imageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const envelope = record(value);
  if (Array.isArray(envelope.data)) return envelope.data;
  throw new Error('Lista inválida');
}
export function parseCategories(value: unknown): Category[] {
  return list(value).map((item) => {
    const data = record(item);
    return {
      id: number(data.id),
      name: name(data.name),
      parentId:
        data.parent_category_id == null
          ? null
          : number(data.parent_category_id),
    };
  });
}
export function parseProducts(value: unknown): Product[] {
  return list(value).map((item) => {
    const data = record(item);
    const store = data.store ? record(data.store) : null;
    const images = Array.isArray(data.images) ? data.images.map(record) : [];
    images.sort((a, b) => number(a.order ?? 0) - number(b.order ?? 0));
    const price = number(data.price);
    const stock = number(data.stock);
    if (price < 0 || stock < 0) throw new Error('Produto inválido');
    const date = typeof data.createdAt === 'string' ? data.createdAt : '';
    return {
      id: number(data.id),
      name: name(data.name),
      price,
      stock,
      categoryId: number(data.category_id),
      image: imageUrl(images[0]?.image_url ?? data.image_url),
      storeName: store ? name(store.name) : '',
      storeLogo: imageUrl(store?.sticker_url ?? store?.logo_url),
      createdAt: Number.isNaN(Date.parse(date)) ? '' : date,
      rating: data.rating == null ? null : number(data.rating),
    };
  });
}
export async function getCatalog(): Promise<CatalogData> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const options: RequestInit = {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(10000),
  };
  const requests = await Promise.allSettled([
    fetch(
      backendUrl(process.env.CATEGORIES_API_PATH ?? '/categorias'),
      options,
    ),
    fetch(backendUrl(process.env.PRODUCTS_API_PATH ?? '/products'), options),
  ]);
  const data: CatalogData = {
    categories: [],
    products: [],
    source: 'api',
    error: null,
  };
  const errors: string[] = [];
  for (const [index, result] of requests.entries()) {
    const label = index === 0 ? 'categorias' : 'produtos';
    if (result.status === 'rejected') {
      errors.push(`Não foi possível conectar ao serviço de ${label}.`);
      continue;
    }
    if (!result.value.ok) {
      const status = result.value.status;
      errors.push(
        status === 404
          ? `Não há acesso às ${label === 'categorias' ? 'categorias' : 'informações dos produtos'} no momento.`
          : status === 401 || status === 403
            ? `Não foi possível acessar ${label} nesta sessão.`
            : `Não foi possível carregar ${label}. Tente novamente.`,
      );
      continue;
    }
    try {
      const value: unknown = await result.value.json();
      if (index === 0) data.categories = parseCategories(value);
      else data.products = parseProducts(value);
    } catch {
      errors.push(
        `O serviço de ${label} retornou dados em um formato inesperado.`,
      );
    }
  }
  data.error = errors.length ? errors.join(' ') : null;
  return data;
}
