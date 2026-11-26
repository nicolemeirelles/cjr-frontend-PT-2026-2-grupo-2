import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/reviews/proxy";
import { cleanText, isRating } from "@/lib/reviews/format";

type Ctx = { params: Promise<{ id: string }> };

const invalid = () =>
  NextResponse.json({ message: "Avaliação inválida." }, { status: 400 });

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return invalid();
  return proxyToBackend(request, {
    method: "PATCH",
    path: `/avaliacao-produto/${id}`,
    buildBody: (input) =>
      isRating(input.rating)
        ? { rating: input.rating, comment: cleanText(input.comment, 1000) }
        : null,
  });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return invalid();
  return proxyToBackend(request, {
    method: "DELETE",
    path: `/avaliacao-produto/${id}`,
  });
}
