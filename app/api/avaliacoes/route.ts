import { proxyToBackend } from "@/lib/reviews/proxy";
import { cleanText, isRating } from "@/lib/reviews/format";

export function POST(request: Request) {
  return proxyToBackend(request, {
    method: "POST",
    path: "/avaliacao-loja",
    buildBody: (input) => {
      if (!Number.isInteger(input.store_id) || !isRating(input.rating))
        return null;
      return {
        store_id: input.store_id,
        rating: input.rating,
        comment: cleanText(input.comment, 1000),
      };
    },
  });
}
