export type Category = {
  id: number;
  name: string;
  parentId: number | null;
};
export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
  image: string | null;
  storeName: string;
  storeLogo: string | null;
  createdAt: string;
  rating: number | null;
};
export type CatalogData = {
  categories: Category[];
  products: Product[];
  source: 'api' | 'demo';
  error: string | null;
};
