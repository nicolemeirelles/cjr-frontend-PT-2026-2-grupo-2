import type { Category, Product } from './types';

export type CatalogStore = {
  id: number;
  name: string;
  logo: string | null;
};

export type CatalogImage = {
  productId: number;
  order: number;
  url: string | null;
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Registro inválido');
  }
  return value as Record<string, unknown>;
}

export function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const envelope = record(value);
  if (Array.isArray(envelope.data)) return envelope.data;
  throw new Error('Lista inválida');
}

function number(value: unknown): number {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && !value.trim())
  ) {
    throw new Error('Número inválido');
  }
  const result = Number(value);
  if (!Number.isFinite(result)) throw new Error('Número inválido');
  return result;
}

function integer(value: unknown, minimum = 1): number {
  const result = number(value);
  if (!Number.isSafeInteger(result) || result < minimum) {
    throw new Error('Inteiro inválido');
  }
  return result;
}

function name(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Nome inválido');
  }
  return value.trim();
}

function imageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function parseCategories(value: unknown): Category[] {
  return list(value).map((item) => {
    const data = record(item);
    return {
      id: integer(data.id),
      name: name(data.name),
      parentId:
        data.parent_category_id == null
          ? null
          : integer(data.parent_category_id),
    };
  });
}

export function parseStores(value: unknown): CatalogStore[] {
  return list(value).map((item) => {
    const data = record(item);
    return {
      id: integer(data.id),
      name: name(data.name),
      logo: imageUrl(data.sticker_url) ?? imageUrl(data.logo_url),
    };
  });
}

export function parseImages(value: unknown): CatalogImage[] {
  return list(value).map((item) => {
    const data = record(item);
    return {
      productId: integer(data.product_id),
      order: integer(data.order, 0),
      url: imageUrl(data.image_url),
    };
  });
}

export function parseProducts(
  value: unknown,
  stores: CatalogStore[] = [],
  images: CatalogImage[] = [],
): Product[] {
  const storesById = new Map(stores.map((store) => [store.id, store]));
  const firstImageByProduct = new Map<number, string>();
  for (const image of [...images].sort((a, b) => a.order - b.order)) {
    if (image.url && !firstImageByProduct.has(image.productId)) {
      firstImageByProduct.set(image.productId, image.url);
    }
  }
  return list(value).map((item) => {
    const data = record(item);
    const id = integer(data.id);
    const store = storesById.get(integer(data.store_id));
    const price = number(data.price);
    if (price < 0) throw new Error('Preço inválido');
    const date = typeof data.createdAt === 'string' ? data.createdAt : '';
    return {
      id,
      name: name(data.name),
      price,
      stock: integer(data.stock, 0),
      categoryId: integer(data.category_id),
      image: firstImageByProduct.get(id) ?? null,
      storeName: store?.name ?? '',
      storeLogo: store?.logo ?? null,
      createdAt: Number.isNaN(Date.parse(date)) ? '' : date,
      rating: null,
    };
  });
}
