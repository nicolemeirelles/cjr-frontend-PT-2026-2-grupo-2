import { proxyToBackend } from "@/lib/reviews/proxy";
import { cleanText, isRating } from "@/lib/reviews/format";

export function POST(request: Request) {
  return proxyToBackend(request, {
    method: "POST",
    path: "/avaliacao-produto",
    buildBody: (input) => {
      if (!Number.isInteger(input.product_id) || !isRating(input.rating))
        return null;
      return {
        product_id: input.product_id,
        rating: input.rating,
        comment: cleanText(input.comment, 1000),
      };
    },
  });
}
