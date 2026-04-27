import { api } from "@/lib/api";
import type { AuthResponse, Role } from "@/lib/types";

interface BackendAuthResponse {
  id: string;
  token: string;
  type: string;
  username: string;
  role: string;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<BackendAuthResponse>("/auth/login", { username, password });
  // O token é recebido pelo backend mas não armazenado no frontend —
  // ele é persistido automaticamente via cookie httpOnly pelo browser
  return {
    user: {
      id: data.id,
      name: data.username,
      username: data.username,
      role: data.role as Role,
    },
  };
}

export async function logout(): Promise<void> {
  // Solicita ao backend que expire o cookie httpOnly
  await api.post("/auth/logout");
}
