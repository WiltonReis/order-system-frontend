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
  return {
    token: data.token,
    user: {
      id: data.id,
      name: data.username,
      username: data.username,
      role: data.role as Role,
    },
  };
}
