import { isAxiosError } from "axios";
import { api } from "@/lib/axios-server";
import type { Product } from "@/lib/catalog/types";

const PRODUCTS_PATH = process.env.PRODUCTS_API_PATH ?? "/produtos";
const RATINGS_PATH =
  process.env.PRODUCT_RATINGS_API_PATH ?? "/avaliacao-produto";
const MAX_IMAGES = 4;

export type ProductReview = {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  userPhoto: string | null;
};

export type ProductDetail = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number | null;
  categoryName: string | null;
  images: string[];
  imageItems: { id: number; url: string }[];
  storeName: string;
  storeId: number | null;
  storeLogo: string | null;
  rating: { average: number; count: number } | null;
  isOwner: boolean;
  sameStore: Product[];
  reviews: ProductReview[];
};

export type ProductDetailResult =
  | { status: "success"; product: ProductDetail }
  | { status: "not-found" }
  | { status: "unavailable" };

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === "object" && value !== null;
const toNumber = (value: unknown): number | null => {
  const number = Number(value);
  return value !== null && value !== "" && Number.isFinite(number)
    ? number
    : null;
};

const toText = (value: unknown): string =>
  typeof value === "string" ? value : "";
const toList = (data: unknown): Raw[] => {
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.data)
      ? data.data
      : [];
  return list.filter(isRecord);
};
const firstImage = (item: Raw): string | null => {
  const images = toList(item.images);
  const url = images[0]?.image_url;
  return typeof url === "string" && url ? url : null;
};

export async function getProductDetail(
  id: number,
  userId: number | null,
): Promise<ProductDetailResult> {
  let raw: Raw;
  try {
    const { data } = await api.get(`${PRODUCTS_PATH}/${id}`);
    if (!isRecord(data)) return { status: "unavailable" };
    raw = data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404)
      return { status: "not-found" };
    return { status: "unavailable" };
  }

  const storeId = toNumber(raw.store_id);
  const [allProducts, ownProducts, ratings] = await Promise.allSettled([
    api.get(PRODUCTS_PATH),
    userId === null
      ? Promise.resolve(null)
      : api.get(PRODUCTS_PATH, { params: { userId } }),
    api.get(RATINGS_PATH, { params: { product_id: id } }),
  ]);

  const allList =
    allProducts.status === "fulfilled" ? toList(allProducts.value.data) : [];
  const listed = allList.find((item) => toNumber(item.id) === id);
  const store = isRecord(listed?.store) ? listed.store : {};
  const storeName = toText(store.name);
  const storeLogo = toText(store.logo_url) || null;
  const isOwner =
    ownProducts.status === "fulfilled" &&
    ownProducts.value !== null &&
    toList(ownProducts.value.data).some((item) => toNumber(item.id) === id);

  const sameStore: Product[] = allList
    .filter((item) => storeId !== null && toNumber(item.store_id) === storeId)
    .filter((item) => toNumber(item.id) !== id)
    .map((item) => ({
      id: toNumber(item.id) ?? 0,
      name: toText(item.name),
      price: toNumber(item.price) ?? 0,
      stock: toNumber(item.stock) ?? 0,
      categoryId: toNumber(item.category_id) ?? 0,
      image: firstImage(item),
      storeName,
      storeLogo,
      createdAt: toText(item.createdAt),
      rating: null,
    }));
  const reviews: ProductReview[] = (
    ratings.status === "fulfilled" ? toList(ratings.value.data) : []
  )
    .filter((item) => toNumber(item.product_id) === id)
    .sort((a, b) => toText(b.createdAt).localeCompare(toText(a.createdAt)))
    .map((item) => {
      const user = isRecord(item.user) ? item.user : {};
      return {
        id: toNumber(item.id) ?? 0,
        rating: Math.min(5, Math.max(0, toNumber(item.rating) ?? 0)),
        comment: toText(item.comment),
        userName:
          toText(user.name) || toText(user.username) || "Cliente Stock.io",
        userPhoto: toText(user.profile_picture_url) || null,
      };
    });

  const rating =
    reviews.length > 0
      ? {
          average:
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length,
          count: reviews.length,
        }
      : null;

  const imageItems = toList(raw.images)
    .sort((a, b) => (toNumber(a.order) ?? 0) - (toNumber(b.order) ?? 0))
    .map((image) => ({ id: toNumber(image.id), url: image.image_url }))
    .filter(
      (image): image is { id: number; url: string } =>
        image.id !== null && typeof image.url === "string" && image.url !== "",
    )
    .slice(0, MAX_IMAGES);
  const images = imageItems.map((image) => image.url);

  return {
    status: "success",
    product: {
      id,
      name: toText(raw.name),
      description: toText(raw.description),
      price: toNumber(raw.price) ?? 0,
      stock: toNumber(raw.stock) ?? 0,
      categoryId: toNumber(raw.category_id),
      categoryName: isRecord(raw.category)
        ? toText(raw.category.name) || null
        : null,
      images,
      imageItems,
      storeName,
      storeId,
      storeLogo,
      rating,
      isOwner,
      sameStore,
      reviews,
    },
  };
}
