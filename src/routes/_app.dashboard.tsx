import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — OMS" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral e métricas do sistema.</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-16 text-center shadow-[var(--shadow-card)]">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
        </span>
        <h2 className="text-lg font-semibold">Em breve</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Métricas de pedidos, gráficos de vendas e indicadores estarão disponíveis aqui em breve.
        </p>
      </div>
    </div>
  );
}
