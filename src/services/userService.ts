import type { Role, User } from "@/lib/types";

let mockUsers: User[] = [
  { id: "1", name: "Administrador", username: "admin", role: "ADMIN" },
  { id: "2", name: "Operador", username: "user", role: "USER" },
  { id: "3", name: "Maria Silva", username: "maria", role: "USER" },
  { id: "4", name: "Carlos Souza", username: "carlos", role: "ADMIN" },
];

/** Replace with: const { data } = await api.get<User[]>("/users"); return data; */
export async function listUsers(): Promise<User[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...mockUsers];
}

/** Replace with: const { data } = await api.post<User>("/users", input); return data; */
export async function createUser(input: { name: string; username: string; role: Role }): Promise<User> {
  await new Promise((r) => setTimeout(r, 200));
  const user: User = { id: String(Date.now()), ...input };
  mockUsers = [user, ...mockUsers];
  return user;
}

/** Replace with: await api.delete(`/users/${id}`); */
export async function deleteUser(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  mockUsers = mockUsers.filter((u) => u.id !== id);
}

/** Replace with: const { data } = await api.patch<User>(`/users/${id}`, { role }); return data; */
export async function updateUserRole(id: string, role: Role): Promise<User> {
  await new Promise((r) => setTimeout(r, 200));
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("Usuário não encontrado");
  mockUsers[idx] = { ...mockUsers[idx], role };
  return mockUsers[idx];
}
