import { api } from "@/lib/api";
import type { PageResponse, Role, User } from "@/lib/types";

interface BackendUserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
}

function mapUser(u: BackendUserResponse): User {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

export async function listUsers(page = 0, size = 20): Promise<PageResponse<User>> {
  const { data } = await api.get<PageResponse<BackendUserResponse>>(
    `/users?page=${page}&size=${size}`,
  );
  return {
    ...data,
    content: data.content.map(mapUser),
  };
}

export async function createUser(input: { name: string; email: string; password: string; role: Role }): Promise<User> {
  const { data } = await api.post<BackendUserResponse>("/users", {
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
  });
  return mapUser(data);
}

export async function updateUser(
  id: string,
  input: { name: string; email: string; password?: string; role: Role },
): Promise<User> {
  const { data } = await api.put<BackendUserResponse>(`/users/${id}`, {
    name: input.name,
    email: input.email,
    role: input.role,
    ...(input.password && { password: input.password }),
  });
  return mapUser(data);
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  const { data } = await api.patch<BackendUserResponse>(`/users/${id}/role`, { role });
  return mapUser(data);
}
