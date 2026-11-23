import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { isSameOrigin, SESSION_COOKIE } from "@/lib/auth";

export type StorePayload = {
  name: string;
  category_id: number;
  logo_url: string;
  banner_url: string;
  sticker_url: string;
};

export function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function checkStoreRequest(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Origem da solicitação inválida.", 403);
  }
  if (!(await cookies()).get(SESSION_COOKIE)?.value) {
    return jsonError("Sua sessão expirou. Entre novamente.", 401);
  }
  return null;
}

export async function readStorePayload(request: Request): Promise<StorePayload | null> {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return null;
  }

  const { name, category_id, logo_url, banner_url, sticker_url } = payload ?? {};
  const validText = [name, logo_url, banner_url, sticker_url].every(
    (value) => typeof value === "string" && value.trim() !== "",
  );
  if (!validText || !Number.isInteger(category_id)) return null;

  return { name: name.trim(), category_id, logo_url, banner_url, sticker_url };
}

export function backendError(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string | string[] }>(error) && error.response) {
    const { status, data } = error.response;
    if (status < 500) {
      return NextResponse.json({ message: data?.message ?? fallback }, { status });
    }
    return jsonError("O serviço de lojas está indisponível. Tente novamente.", 502);
  }
  return jsonError("Não foi possível conectar ao serviço de lojas. Tente novamente.", 503);
}
