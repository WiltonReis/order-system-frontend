import { BarChart2, Package, ShoppingCart, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: ShoppingCart,
    title: "Pedidos em Tempo Real",
    description: "Crie, edite e finalize pedidos com rastreamento de status instantâneo.",
  },
  {
    icon: Package,
    title: "Catálogo de Produtos",
    description: "Gerencie preços, imagens e descrições do seu catálogo com facilidade.",
  },
  {
    icon: BarChart2,
    title: "Métricas e Relatórios",
    description: "Dashboard com receita, ticket médio e top produtos do período.",
  },
  {
    icon: Users,
    title: "Controle de Acesso",
    description: "Defina permissões por usuário com papéis ADMIN e USER.",
  },
];

export function Features() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Tudo que você precisa para operar
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}
                >
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
