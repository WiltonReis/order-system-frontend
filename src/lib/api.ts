import axios from "axios";

console.log("API URL:", import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  // Envia cookies httpOnly automaticamente em todas as requisições
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

let isRefreshing = false;
let pendingQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];

function drainQueue(error: unknown) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  pendingQueue = [];
}

function redirectToLogin() {
  userStorage.clear();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// Interceptor de resposta: ao receber 401, tenta renovar o access token via
// refresh token (cookie httpOnly) antes de forçar re-login.
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as typeof err.config & { _retry?: boolean };

    if (!axios.isAxiosError(err) || err.response?.status !== 401) {
      return Promise.reject(err);
    }

    // Não tentar renovar em endpoints de auth ou em retry já executado
    const isAuthEndpoint = (originalRequest.url as string)?.includes("/auth/");
    if (isAuthEndpoint || originalRequest._retry) {
      redirectToLogin();
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/auth/refresh");
      drainQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      drainQueue(refreshError);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// Converte imageUrl relativa do backend ("/uploads/...") em URL absoluta usando VITE_API_URL.
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/")) {
    const base = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
    return base + url;
  }
  return url;
}

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
