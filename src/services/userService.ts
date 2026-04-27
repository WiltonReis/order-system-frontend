import { api } from "@/lib/api";
import type { Role, User } from "@/lib/types";

interface BackendUserResponse {
  id: string;
  username: string;
  role: Role;
}

function mapUser(u: BackendUserResponse): User {
  return { id: u.id, name: u.username, username: u.username, role: u.role };
}

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<BackendUserResponse[]>("/users");
  return data.map(mapUser);
}

export async function createUser(input: { name: string; username: string; password: string; role: Role }): Promise<User> {
  const { data } = await api.post<BackendUserResponse>("/users", {
    username: input.username,
    password: input.password,
    role: input.role,
  });
  return mapUser(data);
}

export async function updateUser(
  id: string,
  input: { username: string; password?: string; role: Role },
): Promise<User> {
  const { data } = await api.put<BackendUserResponse>(`/users/${id}`, {
    username: input.username,
    password: input.password ?? "",
    role: input.role,
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
