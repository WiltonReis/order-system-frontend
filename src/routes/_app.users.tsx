import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Users as UsersIcon } from "lucide-react";
import { extractErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Role, User } from "@/lib/types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers, useUpdateUserRole } from "@/features/users/hooks/useUsers";
import { deleteUser } from "@/features/users/api/userService";
import { usePagination } from "@/shared/hooks/usePagination";
import { DataTable } from "@/shared/components/DataTable";
import type { TableColumn } from "@/shared/components/DataTable";
import { showUndoToast } from "@/shared/components/UndoToast";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { UserFormDialog } from "@/features/users/components/UserFormDialog";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Usuários — OMS" }] }),
  component: UsersPage,
});

function isAdminMaster(u: User) {
  return u.role === "ADMIN_MASTER";
}

function UsersPage() {
  const { user } = useAuth();
  const { page, prev, next } = usePagination();
  const [formOpen, setFormOpen] = useState(false);
  const [formUser, setFormUser] = useState<User | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data, isPending } = useUsers(page);
  const updateRoleMutation = useUpdateUserRole();

  const allUsers = data?.content ?? [];
  const users = allUsers.filter((u) => !pendingIds.has(u.id));
  const totalPages = data?.totalPages ?? 0;

  if (user && user.role !== "ADMIN" && user.role !== "ADMIN_MASTER") return <Navigate to="/orders" />;

  const handleRoleChange = async (id: string, role: Role) => {
    try {
      await updateRoleMutation.mutateAsync({ id, role });
      toast.success("Permissão atualizada");
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao atualizar permissão"));
    }
  };

  const openCreate = () => {
    setFormUser(null);
    setFormOpen(true);
  };

  const openEdit = (u: User) => {
    setFormUser(u);
    setFormOpen(true);
  };

  const handleDelete = (u: User) => {
    setConfirmDeleteUser(u);
  };

  const executeDelete = () => {
    const u = confirmDeleteUser;
    if (!u) return;
    setConfirmDeleteUser(null);
    setPendingIds((prev) => new Set([...prev, u.id]));
    showUndoToast(
      `Usuário "${u.name}" excluído`,
      async () => {
        try {
          await deleteUser(u.id);
          await queryClient.invalidateQueries({ queryKey: ["users"] });
        } catch (e) {
          toast.error(extractErrorMessage(e, "Erro ao excluir usuário"));
          await queryClient.invalidateQueries({ queryKey: ["users"] });
        }
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(u.id);
          return next;
        });
      },
      () => {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(u.id);
          return next;
        });
      },
    );
  };

  const columns: TableColumn<User>[] = [
    {
      header: "Nome",
      cell: (u) => (
        <span className="font-medium">
          {u.name}
          {u.id === user?.id && <Badge variant="secondary" className="ml-2">você</Badge>}
          {isAdminMaster(u) && <Badge variant="outline" className="ml-2 text-[10px]">master</Badge>}
        </span>
      ),
    },
    {
      header: "E-mail",
      cell: (u) => <span className="text-sm text-muted-foreground">{u.email}</span>,
    },
    {
      header: "Permissão",
      className: "w-[180px]",
      cell: (u) => {
        const isMaster = isAdminMaster(u);
        const isSelf = u.id === user?.id;
        return (
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
        );
      },
    },
    {
      header: <span className="block text-right">Ações</span>,
      className: "w-[120px]",
      cell: (u) => {
        const isMaster = isAdminMaster(u);
        const isSelf = u.id === user?.id;
        return (
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-primary"
                    aria-label={isMaster ? "Não é possível modificar o administrador master" : "Editar usuário"}
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
                    aria-label={isMaster ? "Não é possível modificar o administrador master" : "Excluir usuário"}
                    onClick={() => handleDelete(u)}
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
        );
      },
    },
  ];

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
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo usuário
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(u) => u.id}
          loading={isPending}
          emptyIcon={<UsersIcon className="h-8 w-8 text-muted-foreground" />}
          emptyMessage="Nenhum usuário cadastrado."
          pagination={{ page, total: totalPages, onPrev: prev, onNext: next }}
        />

        <ConfirmDialog
          open={!!confirmDeleteUser}
          onOpenChange={(o) => !o && setConfirmDeleteUser(null)}
          title="Excluir usuário?"
          description={`O usuário "${confirmDeleteUser?.name}" será excluído. Esta ação poderá ser desfeita por alguns segundos.`}
          onConfirm={executeDelete}
          confirmLabel="Excluir"
          destructive
        />

        <UserFormDialog
          user={formUser}
          open={formOpen}
          onOpenChange={setFormOpen}
        />
      </div>
    </TooltipProvider>
  );
}
