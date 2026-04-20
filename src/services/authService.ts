import type { AuthResponse } from "@/lib/types";

/**
 * Replace the mock body with a real call when the backend is ready:
 *   const { data } = await api.post<AuthResponse>("/auth/login", { username, password });
 *   return data;
 */
export async function login(username: string, password: string): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 400));

  const accounts: Record<string, AuthResponse> = {
    admin: {
      token: "mock-jwt-admin",
      user: { id: "1", name: "Administrador", username: "admin", role: "ADMIN" },
    },
    user: {
      token: "mock-jwt-user",
      user: { id: "2", name: "Operador", username: "user", role: "USER" },
    },
  };

  const acc = accounts[username];
  if (!acc || password !== "123456") {
    throw new Error("Credenciais inválidas");
  }
  return acc;
}
