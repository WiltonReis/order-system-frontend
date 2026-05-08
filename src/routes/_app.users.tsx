import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import type { Role, User } from "@/lib/types";
import { toast } from "sonner";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useUpdateUserRole,
  useDeleteUser,
} from "@/hooks/queries/useUsers";
import { createUserSchema, editUserSchema } from "@/schemas/userSchema";
import type { CreateUserFormValues, EditUserFormValues } from "@/schemas/userSchema";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Usuários — OMS" }] }),
  component: UsersPage,
});

function isAdminMaster(u: User) {
  return u.role === "ADMIN_MASTER";
}

function UsersPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data, isPending } = useUsers(page);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const updateRoleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "USER" },
  });

  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "USER" },
  });

  if (user && user.role !== "ADMIN" && user.role !== "ADMIN_MASTER") return <Navigate to="/orders" />;

  const handleRoleChange = async (id: string, role: Role) => {
    try {
      await updateRoleMutation.mutateAsync({ id, role });
      toast.success("Permissão atualizada");
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao atualizar permissão"));
    }
  };

  const handleCreate = createForm.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Usuário criado");
      createForm.reset();
      setCreateOpen(false);
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao criar usuário"));
    }
  });

  const openEdit = (u: User) => {
    setEditUser(u);
    editForm.reset({ name: u.name, email: u.email, password: "", role: u.role as "USER" | "ADMIN" });
    setEditOpen(true);
  };

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editUser) return;
    try {
      await updateMutation.mutateAsync({
        id: editUser.id,
        data: {
          name: values.name,
          email: values.email,
          password: values.password || undefined,
          role: values.role,
        },
      });
      toast.success("Usuário atualizado");
      setEditOpen(false);
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao atualizar usuário"));
    }
  });

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Usuário excluído");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao excluir usuário"));
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
          {isPending ? (
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
                                    onClick={() => setDeleteTarget(u)}
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

        {/* Dialog de criação */}
        <Dialog open={createOpen} onOpenChange={(open) => { if (!open) createForm.reset(); setCreateOpen(open); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo usuário</DialogTitle>
              <DialogDescription>Cadastre um novo usuário e defina sua permissão.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input {...createForm.register("name")} placeholder="Nome do usuário" />
                {createForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" {...createForm.register("email")} placeholder="usuario@empresa.com" />
                {createForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Senha</Label>
                <Input type="password" {...createForm.register("password")} placeholder="••••••" />
                {createForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Permissão</Label>
                <Controller
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de edição */}
        <Dialog open={editOpen} onOpenChange={(open) => { if (!open) editForm.reset(); setEditOpen(open); }}>
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
                <Input {...editForm.register("name")} placeholder="Nome do usuário" />
                {editForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" {...editForm.register("email")} placeholder="usuario@empresa.com" />
                {editForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{editForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Nova senha (opcional)</Label>
                <Input
                  type="password"
                  {...editForm.register("password")}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Permissão</Label>
                <Controller
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleEdit} disabled={updateMutation.isPending}>Salvar</Button>
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
