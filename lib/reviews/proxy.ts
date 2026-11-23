import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendUrl, isSameOrigin, SESSION_COOKIE } from "@/lib/auth";

type Options = {
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  /** Monta o corpo enviado ao backend. Devolva null se os dados forem inválidos. */
  buildBody?: (
    input: Record<string, unknown>,
  ) => Record<string, unknown> | null;
};

const messages: Record<number, string> = {
  400: "Verifique os dados informados.",
  401: "Faça login para continuar.",
  403: "Você não tem permissão para fazer isso.",
  404: "Não encontrado.",
};

const error = (message: string, status: number) =>
  NextResponse.json({ message }, { status });

export async function proxyToBackend(
  request: Request,
  { method, path, buildBody }: Options,
) {
  if (!isSameOrigin(request))
    return error("Origem da solicitação inválida.", 403);

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return error(messages[401], 401);

  let body: string | undefined;
  if (buildBody) {
    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return error(messages[400], 400);
    }
    const built =
      input && typeof input === "object"
        ? buildBody(input as Record<string, unknown>)
        : null;
    if (!built) return error(messages[400], 400);
    body = JSON.stringify(built);
  }

  try {
    const response = await fetch(backendUrl(path), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const status = [400, 401, 403, 404].includes(response.status)
        ? response.status
        : 502;
      return error(
        messages[status] ?? "O serviço está indisponível. Tente novamente.",
        status,
      );
    }
    return NextResponse.json(data ?? {}, {
      status: method === "POST" ? 201 : 200,
    });
  } catch {
    return error("Não foi possível conectar ao serviço. Tente novamente.", 503);
  }
}
