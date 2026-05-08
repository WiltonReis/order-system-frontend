import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
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
            OMS é um sistema SaaS B2B para gestão de pedidos, produtos e usuários — com métricas
            em tempo real e controle de acesso por perfil.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-w-[140px]">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[140px]">
            <Link to="/register">Criar conta grátis</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
