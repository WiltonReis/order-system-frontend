import { Link } from "@tanstack/react-router";
import { Briefcase, Github, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";

export function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(700px circle at 30% 20%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 60%), radial-gradient(600px circle at 70% 80%, color-mix(in oklab, var(--primary-glow) 15%, transparent), transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Portfolio disclaimer badge */}
        <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary">
          <Briefcase className="h-3 w-3 shrink-0" />
          Projeto de portfólio · Simula um SaaS real em produção
        </div>

        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Package className="h-8 w-8 text-primary-foreground" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Gerencie pedidos{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              com simplicidade
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
            OMS é um sistema SaaS B2B multi-tenant para gestão de pedidos, produtos e usuários —
            com métricas em tempo real, exportação de PDF e controle de acesso por perfil.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-w-[140px]">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-w-[140px]">
              <Link to="/register">Criar conta grátis</Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="lg">
            <Link to="/dashboard">Ir para o Dashboard</Link>
          </Button>
        )}

        {/* GitHub links */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a
            href="https://github.com/WiltonReis/order-system-backend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" />
            Backend
          </a>
          <span aria-hidden>·</span>
          <a
            href="https://github.com/WiltonReis/order-system-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" />
            Frontend
          </a>
        </div>
      </div>
    </section>
  );
}
