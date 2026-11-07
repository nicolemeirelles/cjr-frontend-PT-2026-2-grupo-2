import { backendUrl } from "@/lib/auth";
import type { Product } from "./types";

type ApiProduct = {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  category_id: number;
  createdAt: string;
  store: { name: string; logo_url: string | null };
  images: { image_url: string }[];
};

export async function getUserProducts(userId: number): Promise<Product[]> {
  try {
    const response = await fetch(backendUrl(`/produtos?userId=${userId}`), {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return [];
    const data: ApiProduct[] = await response.json();
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      stock: p.stock,
      categoryId: p.category_id,
      image: p.images[0]?.image_url ?? null,
      storeName: p.store.name,
      storeLogo: p.store.logo_url,
      createdAt: p.createdAt,
      rating: null,
    }));
  } catch {
    return [];
  }
}
