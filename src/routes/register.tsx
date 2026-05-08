import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate, Navigate, Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { register as registerRequest } from "@/services/authService";
import { extractErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { registerSchema } from "@/schemas/registerSchema";
import type { RegisterFormValues } from "@/schemas/registerSchema";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Criar conta — OMS" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  if (isAuthenticated) return <Navigate to="/orders" />;

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerRequest({
        companyName: values.companyName,
        cpfCnpj: values.cpfCnpj,
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success("Conta criada com sucesso. Faça login para continuar.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao criar conta"));
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(600px circle at 20% 20%, color-mix(in oklab, var(--primary) 25%, transparent), transparent 60%), radial-gradient(500px circle at 80% 80%, color-mix(in oklab, var(--primary-glow) 20%, transparent), transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Registre sua empresa no OMS</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Razão social / Nome da empresa</Label>
            <Input
              id="companyName"
              autoFocus
              placeholder="Empresa Ltda."
              {...register("companyName")}
            />
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cpfCnpj">CPF / CNPJ</Label>
            <Input
              id="cpfCnpj"
              placeholder="00000000000000"
              maxLength={18}
              {...register("cpfCnpj")}
            />
            {errors.cpfCnpj && (
              <p className="text-xs text-destructive">{errors.cpfCnpj.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do administrador</Label>
            <Input
              id="name"
              placeholder="Seu nome"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@empresa.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="underline-offset-2 hover:underline">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
