import { NextResponse } from "next/server";
import { api } from "@/lib/axios-server";
import {
  backendError,
  checkStoreRequest,
  jsonError,
  readStorePayload,
} from "@/lib/store-route";

export async function POST(request: Request) {
  const blocked = await checkStoreRequest(request);
  if (blocked) return blocked;

  const payload = await readStorePayload(request);
  if (!payload) return jsonError("Dados da loja inválidos.", 400);

  try {
    const response = await api.post("/lojas", payload);
    if (typeof response.data?.id !== "number") {
      return jsonError("O serviço de lojas retornou uma resposta inválida.", 502);
    }
    return NextResponse.json({ id: response.data.id }, { status: 201 });
  } catch (error) {
    return backendError(error, "Não foi possível criar a loja.");
  }
}
