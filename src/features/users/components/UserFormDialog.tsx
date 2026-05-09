import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { extractErrorMessage } from "@/lib/api";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { editUserSchema } from "../schemas/userSchema";
import type { EditUserFormValues } from "../schemas/userSchema";
import type { User } from "@/lib/types";

interface Props {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormDialog({ user, open, onOpenChange }: Props) {
  const isEdit = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "USER" },
  });

  useEffect(() => {
    if (!open) return;
    if (user) {
      form.reset({ name: user.name, email: user.email, password: "", role: user.role as "USER" | "ADMIN" });
    } else {
      form.reset({ name: "", email: "", password: "", role: "USER" });
    }
  }, [open, user]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!isEdit && !values.password) {
      form.setError("password", { message: "Senha obrigatória" });
      return;
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: user!.id,
          data: {
            name: values.name,
            email: values.email,
            password: values.password || undefined,
            role: values.role,
          },
        });
        toast.success("Usuário atualizado");
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password!,
          role: values.role,
        });
        toast.success("Usuário criado");
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(extractErrorMessage(e, isEdit ? "Erro ao atualizar usuário" : "Erro ao criar usuário"));
    }
  });

  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) form.reset(); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Altere os dados do usuário. Deixe a senha em branco para mantê-la."
              : "Cadastre um novo usuário e defina sua permissão."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input {...form.register("name")} placeholder="Nome do usuário" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" {...form.register("email")} placeholder="usuario@empresa.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{isEdit ? "Nova senha (opcional)" : "Senha"}</Label>
            <Input
              type="password"
              {...form.register("password")}
              placeholder={isEdit ? "Deixe em branco para não alterar" : "••••••"}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Permissão</Label>
            <Controller
              control={form.control}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
