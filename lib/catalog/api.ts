import 'server-only';
import { cookies } from 'next/headers';
import { backendUrl, SESSION_COOKIE } from '@/lib/auth';
import {
  list,
  parseCategories,
  parseImages,
  parseProducts,
  parseStores,
} from './normalize';
import type { CatalogImage, CatalogStore } from './normalize';
import type { CatalogData } from './types';

export async function getCatalog(): Promise<CatalogData> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const options: RequestInit = {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(10000),
  };
  const routes = [
    {
      path: process.env.CATEGORIES_API_PATH ?? '/categorias',
      label: 'categorias',
    },
    { path: process.env.PRODUCTS_API_PATH ?? '/produtos', label: 'produtos' },
    { path: process.env.STORES_API_PATH ?? '/lojas', label: 'lojas' },
    {
      path: process.env.PRODUCT_IMAGES_API_PATH ?? '/imagens',
      label: 'imagens',
    },
  ];
  const responses = await Promise.allSettled(
    routes.map(({ path }) => fetch(backendUrl(path), options)),
  );
  const data: CatalogData = {
    categories: [],
    products: [],
    source: 'api',
    error: null,
  };
  let products: unknown[] = [];
  let stores: CatalogStore[] = [];
  let images: CatalogImage[] = [];
  const errors: string[] = [];
  for (const [index, result] of responses.entries()) {
    const { label } = routes[index];
    if (result.status === 'rejected') {
      errors.push(`Não foi possível conectar ao serviço de ${label}.`);
      continue;
    }
    if (!result.value.ok) {
      errors.push(
        result.value.status === 401 || result.value.status === 403
          ? `Não foi possível acessar ${label} nesta sessão.`
          : `Não foi possível carregar ${label}. Tente novamente.`,
      );
      continue;
    }
    try {
      const value: unknown = await result.value.json();
      if (index === 0) data.categories = parseCategories(value);
      if (index === 1) products = list(value);
      if (index === 2) stores = parseStores(value);
      if (index === 3) images = parseImages(value);
    } catch {
      errors.push(
        `O serviço de ${label} retornou dados em um formato inesperado.`,
      );
    }
  }
  try {
    data.products = parseProducts(products, stores, images);
  } catch {
    errors.push(
      'O serviço de produtos retornou dados em um formato inesperado.',
    );
  }
  data.error = errors.length ? errors.join(' ') : null;
  return data;
}
