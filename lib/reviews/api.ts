import "server-only";
import { backendUrl } from "@/lib/auth";
import type { ReviewDetails, ReviewStore } from "./types";

async function getJson<T>(path: string): Promise<T | "not-found"> {
  const response = await fetch(backendUrl(path), {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 404) return "not-found";
  if (!response.ok) throw new Error(`Falha ao carregar ${path}`);
  return response.json();
}

export async function getReviewPage(
  id: number,
): Promise<
  | { status: "ok"; review: ReviewDetails; store: ReviewStore }
  | { status: "not-found" }
  | { status: "unavailable" }
> {
  try {
    const review = await getJson<ReviewDetails>(`/avaliacao-loja/${id}`);
    if (review === "not-found") return { status: "not-found" };
    const store = await getJson<ReviewStore>(`/lojas/${review.store.id}`);
    if (store === "not-found") return { status: "not-found" };
    return { status: "ok", review, store };
  } catch {
    return { status: "unavailable" };
  }
}
