import type { CatalogData, Category, Product } from './types';
export const demoCategories: Category[] = [
  { id: 1, name: 'Mercado', parentId: null },
  { id: 2, name: 'Farmácia', parentId: null },
  { id: 3, name: 'Beleza', parentId: null },
  { id: 4, name: 'Moda', parentId: null },
  { id: 5, name: 'Eletrônicos', parentId: null },
  { id: 6, name: 'Jogos', parentId: null },
  { id: 7, name: 'Brinquedos', parentId: null },
  { id: 8, name: 'Casa', parentId: null },
  { id: 51, name: 'Celulares', parentId: 5 },
  { id: 52, name: 'Notebooks', parentId: 5 },
  { id: 53, name: 'TVs', parentId: 5 },
  { id: 54, name: 'Acessórios', parentId: 5 },
  { id: 55, name: 'Outros', parentId: 5 },
];
const entries: [string, number, number, number, string, string, string][] = [
  ['Brownie Meio A.', 4.7, 12, 1, 'mercado-0', 'CJR', 'mercado-1'],
  ['Brownie Trad.', 3.8, 0, 1, 'mercado-2', 'CJR', 'mercado-1'],
  ['Nozes', 29.99, 8, 1, 'mercado-3', 'Carts & Baskets', 'mercado-4'],
  ['Banana', 3.99, 24, 1, 'mercado-5', 'Mauá Mar', 'mercado-6'],
  ['Limão Siciliano', 17.99, 15, 1, 'mercado-7', 'Mauá Mar', 'mercado-6'],
  ['Comp. Lenovo', 3899.99, 5, 52, 'eletronicos-0', 'Rêpiit', 'eletronicos-1'],
  ['Comp. Samsung', 8549.99, 0, 52, 'eletronicos-2', 'Rêpiit', 'eletronicos-1'],
  ['Iphone 15', 4769.1, 4, 51, 'eletronicos-3', 'Peri Sal', 'eletronicos-4'],
  ['Smart Tv Philips', 1229, 9, 53, 'eletronicos-5', 'Rêpiit', 'eletronicos-1'],
  ['Xbox Series X', 3599.99, 3, 55, 'eletronicos-6', 'Hobby', 'eletronicos-7'],
];
export const demoProducts: Product[] = entries.map((entry, index) => ({
  id: index + 1,
  name: entry[0],
  price: entry[1],
  stock: entry[2],
  categoryId: entry[3],
  image: `/catalogo/${entry[4]}.webp`,
  storeName: entry[5],
  storeLogo: `/catalogo/${entry[6]}.webp`,
  createdAt: new Date(Date.UTC(2026, 9, 1 + index)).toISOString(),
  rating: null,
}));
export function getDemoCatalog(): CatalogData {
  return {
    categories: demoCategories,
    products: demoProducts,
    source: 'demo',
    error: null,
  };
}
