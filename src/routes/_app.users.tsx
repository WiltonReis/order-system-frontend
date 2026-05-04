import { useEffect, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, Users as UsersIcon } from "lucide-react";
import { extractErrorMessage } from "@/lib/api";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  updateUser,
  updateUserRole,
} from "@/services/userService";
import type { Role, User } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Usuários — OMS" }] }),
  component: UsersPage,
});

function isAdminMaster(u: User) {
  return u.role === "ADMIN_MASTER";
}

function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadKey, setLoadKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("USER");

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<Role>("USER");

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await listUsers(page);
        if (!cancelled) {
          setUsers(result.content);
          setTotalPages(result.totalPages);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, loadKey]);

  const refresh = () => setLoadKey((k) => k + 1);

  if (user && user.role !== "ADMIN" && user.role !== "ADMIN_MASTER") return <Navigate to="/orders" />;

  const handleRoleChange = async (id: string, role: Role) => {
    try {
      await updateUserRole(id, role);
      toast.success("Permissão atualizada");
      refresh();
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao atualizar permissão"));
    }
  };

  const handleDeleteClick = (u: User) => {
    setDeleteTarget(u);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      toast.success("Usuário excluído");
      setDeleteTarget(null);
      refresh();
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao excluir usuário"));
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Preencha o nome");
      return;
    }
    if (!newEmail.trim()) {
      toast.error("Preencha o e-mail");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Preencha a senha");
      return;
    }
    try {
      await createUser({ name: newName.trim(), email: newEmail.trim(), password: newPassword, role: newRole });
      toast.success("Usuário criado");
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("USER");
      setCreateOpen(false);
      refresh();
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao criar usuário"));
    }
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword("");
    setEditRole(u.role);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editUser) return;
    if (!editName.trim()) {
      toast.error("Preencha o nome");
      return;
    }
    if (!editEmail.trim()) {
      toast.error("Preencha o e-mail");
      return;
    }
    try {
      await updateUser(editUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        password: editPassword || undefined,
        role: editRole,
      });
      toast.success("Usuário atualizado");
      setEditOpen(false);
      refresh();
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao atualizar usuário"));
    }
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
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead className="w-[180px]">Permissão</TableHead>
                    <TableHead className="w-[120px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const isMaster = isAdminMaster(u);
                    const isSelf = u.id === user?.id;
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.name}
                          {isSelf && (
                            <Badge variant="secondary" className="ml-2">você</Badge>
                          )}
                          {isMaster && (
                            <Badge variant="outline" className="ml-2 text-[10px]">master</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(v) => handleRoleChange(u.id, v as Role)}
                            disabled={isSelf || isMaster}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {isMaster && <SelectItem value="ADMIN_MASTER">ADMIN_MASTER</SelectItem>}
                              <SelectItem value="ADMIN">ADMIN</SelectItem>
                              <SelectItem value="USER">USER</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:text-primary"
                                    onClick={() => openEdit(u)}
                                    disabled={isMaster}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isMaster ? "Não é possível modificar o administrador master" : "Editar usuário"}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteClick(u)}
                                    disabled={isSelf || isMaster}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isMaster ? "Não é possível modificar o administrador master" : "Excluir usuário"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
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
                <Label>Nome</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do usuário" />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="usuario@empresa.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Senha</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••" />
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

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar usuário</DialogTitle>
              <DialogDescription>
                Altere os dados do usuário. Deixe a senha em branco para mantê-la.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome do usuário" />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="usuario@empresa.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Nova senha (opcional)</Label>
                <Input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Permissão</Label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as Role)}>
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
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleEdit}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
              <AlertDialogDescription>
                O usuário "{deleteTarget?.name}" será permanentemente removido do sistema. Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
