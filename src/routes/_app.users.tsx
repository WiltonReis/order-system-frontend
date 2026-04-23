import { useEffect, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Plus, Trash2, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUserRole,
} from "@/services/userService";
import type { Role, User } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Usuários — OMS" }] }),
  component: UsersPage,
});

function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState<Role>("USER");

  const refresh = async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (user && user.role !== "ADMIN") return <Navigate to="/orders" />;

  const handleRoleChange = async (id: string, role: Role) => {
    await updateUserRole(id, role);
    toast.success("Permissão atualizada");
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este usuário?")) return;
    await deleteUser(id);
    toast.success("Usuário excluído");
    refresh();
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newUsername.trim()) {
      toast.error("Preencha nome e usuário");
      return;
    }
    await createUser({ name: newName.trim(), username: newUsername.trim(), role: newRole });
    toast.success("Usuário criado");
    setNewName("");
    setNewUsername("");
    setNewRole("USER");
    setCreateOpen(false);
    refresh();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie acesso e permissões dos usuários do sistema.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo usuário
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nome</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="w-[180px]">Permissão</TableHead>
                  <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                      {u.id === user?.id && (
                        <Badge variant="secondary" className="ml-2">você</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">@{u.username}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u.id, v as Role)}
                        disabled={u.id === user?.id}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="USER">USER</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(u.id)}
                            disabled={u.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir usuário</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo usuário</DialogTitle>
              <DialogDescription>Cadastre um novo usuário e defina sua permissão.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Maria Silva" />
              </div>
              <div className="space-y-1.5">
                <Label>Usuário (login)</Label>
                <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="ex: maria" />
              </div>
              <div className="space-y-1.5">
                <Label>Permissão</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
