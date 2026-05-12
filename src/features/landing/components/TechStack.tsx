import { BookOpen, ExternalLink, GitBranch, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfraCard {
  label: string;
  tech: string;
  detail: string;
}

const INFRA: InfraCard[] = [
  { label: "Frontend", tech: "Cloudflare Workers", detail: "TanStack Start — SSR/edge, deploy via Wrangler" },
  { label: "Backend", tech: "Fly.io + Docker", detail: "Spring Boot 3 em container multi-stage, região São Paulo" },
  { label: "Banco de dados", tech: "Supabase", detail: "PostgreSQL 16 gerenciado + Flyway migrations versionadas" },
  { label: "Armazenamento", tech: "Cloudflare R2", detail: "Upload de imagens de produtos via AWS SDK v2" },
];

const BACKEND_TECH = [
  "Java 21", "Spring Boot 3.2", "Spring Security 6", "Spring Data JPA",
  "Hibernate 6 (@Filter)", "PostgreSQL 16", "Flyway", "JJWT 0.12.3",
  "Bucket4j", "OpenPDF", "caelum-stella", "Testcontainers", "springdoc-openapi",
];

const FRONTEND_TECH = [
  "React 19", "TypeScript 5.8", "TanStack Router", "TanStack Query",
  "TanStack Start", "React Hook Form", "Zod", "shadcn/ui + Radix UI",
  "Tailwind CSS v4", "Recharts", "Sonner", "Axios", "Vite 7", "Bun",
];

function TechPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {label}
    </span>
  );
}

export function TechStack() {
  return (
    <section className="border-t border-border px-4 py-20">
      <div className="mx-auto max-w-5xl space-y-16">

        {/* Infra */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}
            >
              <Server className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Arquitetura &amp; Infraestrutura
            </h2>
          </div>
          <p className="mb-8 text-sm text-muted-foreground">
            Stack completa em produção — cada camada rodando no serviço mais adequado ao seu custo-benefício.
          </p>

          {/* Architecture diagram */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-muted/30 p-5 font-mono text-xs leading-relaxed text-muted-foreground">
            <pre className="overflow-x-auto whitespace-pre">{`Browser / Cloudflare Workers (Frontend)
         │ HTTPS + Cookie httpOnly (JWT)
         ▼
  Spring Boot API — Fly.io Docker (Backend)
  RateLimitFilter → JwtAuthenticationFilter → MdcFilter
         │
  Controllers → Services → Repositories
  Hibernate @Filter (tenant) + @SQLRestriction (soft-delete)
         │ JDBC + Flyway migrations
         ▼
  PostgreSQL 16 — Supabase

  Imagens de produtos → Cloudflare R2 (AWS SDK v2)`}</pre>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INFRA.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-foreground">{item.tech}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stacks */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}
            >
              <GitBranch className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Tecnologias</h2>
          </div>
          <p className="mb-8 text-sm text-muted-foreground">
            Escolhas técnicas pragmáticas — sem over-engineering, sem under-engineering.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Backend */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Backend
              </p>
              <div className="flex flex-wrap gap-2">
                {BACKEND_TECH.map((t) => (
                  <TechPill key={t} label={t} />
                ))}
              </div>
            </div>

            {/* Frontend */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Frontend
              </p>
              <div className="flex flex-wrap gap-2">
                {FRONTEND_TECH.map((t) => (
                  <TechPill key={t} label={t} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CI/CD + Swagger */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* CI/CD */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}
              >
                <GitBranch className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold">CI/CD — GitHub Actions</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Backend:</span>{" "}
                Maven verify (Testcontainers + Postgres) → Docker build → deploy Fly.io em{" "}
                <code className="rounded bg-muted px-1 text-xs">main</code>
              </li>
              <li>
                <span className="font-medium text-foreground">Frontend:</span>{" "}
                ESLint → TypeScript check → Vite build → Wrangler deploy em{" "}
                <code className="rounded bg-muted px-1 text-xs">main</code>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Segredos via GitHub Secrets — nunca em arquivo versionado.
            </p>
          </div>

          {/* Swagger */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}
              >
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold">Documentação da API</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Todos os endpoints documentados via{" "}
              <span className="font-medium text-foreground">springdoc-openapi</span>. Swagger UI
              disponível em qualquer instância rodando — inclusive localmente em{" "}
              <code className="rounded bg-muted px-1 text-xs">localhost:8080/swagger-ui.html</code>.
            </p>
            <p className="text-xs text-muted-foreground">
              O link de produção abaixo pode estar indisponível — manter a instância no Fly.io tem custo
              contínuo não viável para portfólio.
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-auto w-fit"
            >
              <a
                href="https://order-system-backend-noble-fog-4603.fly.dev/swagger-ui/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Swagger UI (produção)
              </a>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
