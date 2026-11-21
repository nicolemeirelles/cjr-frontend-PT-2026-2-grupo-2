import { NextResponse } from "next/server";
import { api } from "@/lib/axios-server";
import { parseStoreId } from "@/lib/store";
import {
  backendError,
  checkStoreRequest,
  jsonError,
  readStorePayload,
} from "@/lib/store-route";

export async function PATCH(request: Request, context: RouteContext<"/api/lojas/[id]">) {
  const blocked = await checkStoreRequest(request);
  if (blocked) return blocked;

  const storeId = parseStoreId((await context.params).id);
  if (storeId === null) return jsonError("Loja inválida.", 400);

  const payload = await readStorePayload(request);
  if (!payload) return jsonError("Dados da loja inválidos.", 400);

  try {
    await api.patch(`/lojas/${storeId}`, payload);
    return NextResponse.json({ id: storeId });
  } catch (error) {
    return backendError(error, "Não foi possível salvar a loja.");
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/lojas/[id]">) {
  const blocked = await checkStoreRequest(request);
  if (blocked) return blocked;

  const storeId = parseStoreId((await context.params).id);
  if (storeId === null) return jsonError("Loja inválida.", 400);

  try {
    await api.delete(`/lojas/${storeId}`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return backendError(error, "Não foi possível deletar a loja.");
  }
}
