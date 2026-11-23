import "server-only";
import { backendUrl } from "@/lib/auth";
import type { Product } from "@/lib/catalog/types";

type ApiStore = {
  id: number;
  user_id: number;
  name: string;
  logo_url: string | null;
  banner_url: string | null;
  category: { name: string };
  user: { name: string };
  products?: {
    id: number;
    name: string;
    price: string | number;
    stock: number;
    category_id: number;
    createdAt: string;
    images?: { image_url: string }[];
  }[];
  storeRatings?: {
    id: number;
    rating: number;
    comment: string | null;
    user: { name: string; profile_picture_url: string | null };
  }[];
  average_rating?: number | null;
};

export type StoreReview = {
  id: number;
  rating: number;
  comment: string | null;
  authorName: string;
  authorPhoto: string | null;
};

export type Store = {
  id: number;
  ownerId: number;
  ownerName: string;
  name: string;
  categoryName: string;
  bannerUrl: string | null;
  averageRating: number | null;
  reviews: StoreReview[];
  products: Product[];
};

export async function getStore(
  id: number,
): Promise<
  | { status: "success"; store: Store }
  | { status: "not_found" }
  | { status: "unavailable" }
> {
  try {
    const response = await fetch(backendUrl(`/lojas/${id}`), {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 404) return { status: "not_found" };
    if (!response.ok) return { status: "unavailable" };

    const data: ApiStore = await response.json();
    const store: Store = {
      id: data.id,
      ownerId: data.user_id,
      ownerName: data.user.name,
      name: data.name,
      categoryName: data.category.name,
      bannerUrl: data.banner_url || null,
      averageRating: data.average_rating ?? null,
      reviews: (data.storeRatings ?? []).map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        authorName: review.user.name,
        authorPhoto: review.user.profile_picture_url,
      })),
      products: (data.products ?? []).map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        stock: product.stock,
        categoryId: product.category_id,
        image: product.images?.[0]?.image_url ?? null,
        storeName: data.name,
        storeLogo: data.logo_url || null,
        createdAt: product.createdAt,
        rating: null,
      })),
    };
    return { status: "success", store };
  } catch {
    return { status: "unavailable" };
  }
}
