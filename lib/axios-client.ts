import axios, { isAxiosError } from 'axios';

export const clientApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});


type ApiErrorBody = { message?: string | string[] };

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return 'Sem conexão com o servidor. Tente novamente.'; 
    }
    if (error.response.status === 401) {
      return 'Sua sessão expirou. Entre novamente.';
    }

    const message = error.response.data?.message;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string' && message) return message;
    return fallback;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}