import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { api } from "@/lib/axios-server";
import { isSameOrigin, SESSION_COOKIE } from "@/lib/auth";

function backendError(error: unknown) {
  if (isAxiosError<{ message?: string | string[] }>(error) && error.response) {
    const { status, data } = error.response;
    if (status < 500) {
      return NextResponse.json(
        { message: data?.message ?? "Não foi possível criar a loja." },
        { status },
      );
    }
    return NextResponse.json(
      { message: "O serviço de lojas está indisponível. Tente novamente." },
      { status: 502 },
    );
  }
  return NextResponse.json(
    { message: "Não foi possível conectar ao serviço de lojas. Tente novamente." },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Origem da solicitação inválida." }, { status: 403 });
  }

  if (!(await cookies()).get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ message: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Dados da loja inválidos." }, { status: 400 });
  }

  const { name, category_id, logo_url, banner_url, sticker_url } = payload ?? {};
  const validText = [name, logo_url, banner_url, sticker_url].every(
    (value) => typeof value === "string" && value.trim() !== "",
  );
  if (!validText || !Number.isInteger(category_id)) {
    return NextResponse.json({ message: "Dados da loja inválidos." }, { status: 400 });
  }

  try {
    const response = await api.post("/lojas", {
      name: name.trim(),
      category_id,
      logo_url,
      banner_url,
      sticker_url,
    });
    if (typeof response.data?.id !== "number") {
      return NextResponse.json(
        { message: "O serviço de lojas retornou uma resposta inválida." },
        { status: 502 },
      );
    }
    return NextResponse.json({ id: response.data.id }, { status: 201 });
  } catch (error) {
    return backendError(error);
  }
}
