import { api } from "@/lib/api";
import type { AuthResponse, Role } from "@/lib/types";

interface BackendAuthResponse {
  id: string;
  token: string;
  type: string;
  email: string;
  name: string;
  role: string;
  customerSaasId: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<BackendAuthResponse>("/auth/login", { email, password });
  return {
    user: {
      id: data.id,
      name: data.name,
      email: data.email,
      customerSaasId: data.customerSaasId,
      role: data.role as Role,
    },
  };
}

export async function register(input: {
  companyName: string;
  cpfCnpj: string;
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  await api.post("/auth/register", input);
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
