import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  // Envia o cookie httpOnly automaticamente em todas as requisições
  withCredentials: true,
});

const USER_KEY = "oms.user";

// Armazena apenas dados de display do usuário (não o token — ele fica no cookie httpOnly)
export const userStorage = {
  get: (): unknown | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  set: (user: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => localStorage.removeItem(USER_KEY),
};

// Redireciona para login quando o token expira (401) ou sessão é inválida
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      userStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

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
