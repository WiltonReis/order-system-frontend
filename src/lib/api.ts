import axios from "axios";

/**
 * Axios instance configured for the future Spring Boot backend.
 * Set VITE_API_URL in your env when ready to plug the real API.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "oms.token";

export const tokenStorage = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Extrai a mensagem de erro do backend a partir de erros Axios ou genéricos.
 * O backend retorna { message, status } no corpo dos erros.
 */
export function extractErrorMessage(e: unknown, fallback = "Erro inesperado"): string {
  if (axios.isAxiosError(e)) {
    const msg = (e.response?.data as { message?: string } | undefined)?.message;
    if (msg) return msg;
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}
