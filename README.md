# Order Management System — Frontend

[![Frontend CI](https://github.com/WiltonReis/order-system-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/WiltonReis/order-system-frontend/actions/workflows/ci.yml)
[![Deploy](https://github.com/WiltonReis/order-system-frontend/actions/workflows/deploy.yml/badge.svg)](https://github.com/WiltonReis/order-system-frontend/actions/workflows/deploy.yml)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![TanStack](https://img.shields.io/badge/TanStack-Router%20%2F%20Query-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow)

SPA multi-tenant para gerenciamento de pedidos. Consome a API REST do OMS Backend com autenticação via cookie `httpOnly`, rotas protegidas, formulários validados e exportação de PDF.

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Infraestrutura](#infraestrutura)
- [Funcionalidades](#funcionalidades)
- [Screenshots](#screenshots)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura de features](#estrutura-de-features)
- [Decisões técnicas](#decisões-técnicas)
- [Backend](#backend)
- [Licença](#licença)

---

## Sobre o projeto

O **OMS Frontend** é a interface de um SaaS B2B de portfólio para gestão de pedidos. Cada empresa (tenant) acessa seus próprios dados de forma isolada; o isolamento é garantido pelo backend e refletido na UI por contexto de autenticação.

O objetivo é demonstrar em portfólio uma SPA moderna com arquitetura feature-sliced, gerenciamento de estado servidor com React Query, formulários com validação client-side e integração completa com API REST.

**Backend:** [github.com/WiltonReis/order-system-backend](https://github.com/WiltonReis/order-system-backend)

| | Link |
|---|---|
| Produção | [tanstack-start-app.wiltonfilho0825.workers.dev](https://tanstack-start-app.wiltonfilho0825.workers.dev) |

> **Disponibilidade online:** a aplicação pode não estar disponível — manter a instância no Fly.io (backend) tem custo contínuo não viável para um projeto de portfólio. Para avaliar, rode localmente com Docker Compose ou acesse o código-fonte.

---

## Infraestrutura

| Componente | Tecnologia | Detalhes |
|---|---|---|
| Frontend | [Cloudflare Workers](https://workers.cloudflare.com) | TanStack Start (SSR/edge), `wrangler deploy` |
| Backend | [Fly.io](https://fly.io) | Spring Boot 3 em Docker, região São Paulo |
| Banco de dados | [Supabase](https://supabase.com) | PostgreSQL 16 gerenciado |
| Imagens de produtos | [Cloudflare R2](https://cloudflare.com/r2) | Upload direto via backend |

---

## Funcionalidades

- **Landing page** — Hero + seção de funcionalidades + CTAs de login e registro; redirect automático para `/dashboard` se já autenticado
- **Registro de empresa** — Formulário com validação de CNPJ/CPF, criação do primeiro usuário ADMIN
- **Autenticação** — Login com JWT em cookie `httpOnly`; refresh token transparente; logout limpa ambos os cookies
- **Dashboard** — Gráficos de pedidos por status (pizza) e receita por período (linha), métricas de resumo
- **Pedidos** — Listagem paginada com filtros (status, período, usuário, cliente, código), detalhe em dialog com duas abas (Detalhes e Histórico de status), exportação de PDF
- **Undo delete** — Soft-delete com toast Sonner "Pedido excluído. Desfazer?" por 5 segundos
- **Produtos** — CRUD com upload de imagem, listagem paginada
- **Usuários** — Gestão de membros da empresa (restrito a ADMIN)
- **Dark mode** — Toggle claro / escuro / sistema com persistência em `localStorage`, sem flash de tema errado no primeiro paint
- **Acessibilidade** — `aria-label` em todos os botões de ícone, Error Boundary com fallback em pt-BR

---

## Screenshots

### Landing page
```
<!-- [SCREENSHOT] Adicionar: docs/screenshots/landing.png
     O que mostrar: página inicial (/) com hero, seção de funcionalidades e botões "Entrar" / "Criar conta" -->
```

### Dashboard
```
<!-- [SCREENSHOT] Adicionar: docs/screenshots/dashboard.png
     O que mostrar: dashboard com gráfico de pizza (pedidos por status) e gráfico de linha (receita) -->
```

### Listagem de pedidos
```
<!-- [SCREENSHOT] Adicionar: docs/screenshots/orders.png
     O que mostrar: tabela de pedidos com a barra de filtros expandida (status, período, cliente, código) -->
```

### Detalhe do pedido
```
<!-- [SCREENSHOT] Adicionar: docs/screenshots/order-details.png
     O que mostrar: dialog de detalhes aberto na aba "Detalhes" — itens, desconto, total e botão "Exportar PDF" -->
```

### Exportação de PDF
```
<!-- [GIF] Adicionar: docs/screenshots/pdf-export.gif
     O que mostrar: clicar em "Exportar PDF" → loading no botão → PDF abrindo com dados completos do pedido -->
```

### Dark mode
```
<!-- [SCREENSHOT] Adicionar: docs/screenshots/dark-mode.png
     O que mostrar: listagem de pedidos ou dashboard no tema escuro -->
```

---

## Arquitetura

```
src/
├── features/               # Domínios da aplicação (feature-sliced)
│   ├── auth/               # Context de autenticação, serviços, schemas
│   ├── dashboard/          # API + hooks de métricas
│   ├── landing/            # Componentes da página pública
│   ├── orders/             # Componentes, hooks, API, exportação PDF
│   ├── products/           # Componentes, API, schemas
│   └── users/              # Componentes, hooks, API, schemas
│
├── shared/                 # Utilitários e componentes cross-domain
│   ├── components/
│   │   ├── layout/         # Header com navegação e ThemeToggle
│   │   ├── ConfirmDialog   # Dialog de confirmação genérico
│   │   ├── DataTable       # Tabela reutilizável
│   │   ├── ThemeProvider   # Contexto de tema (light/dark/system)
│   │   └── ThemeToggle     # Dropdown de seleção de tema
│   └── hooks/
│       └── usePagination   # Controle de página/tamanho
│
├── components/ui/          # Primitivos shadcn/ui — NÃO MODIFICAR
├── lib/
│   ├── api.ts              # Instância Axios (baseURL, interceptors)
│   ├── format.ts           # Formatadores de moeda e data (pt-BR)
│   └── types.ts            # Tipos de domínio (Order, Product, User)
│
└── routes/                 # TanStack Router — arquivo por rota
    ├── __root.tsx           # Layout raiz (QueryClient, ThemeProvider, AuthProvider)
    ├── index.tsx            # Landing page (/)
    ├── login.tsx            # Login
    ├── register.tsx         # Registro de empresa
    ├── _app.tsx             # Layout protegido (guard de autenticação)
    ├── _app.dashboard.tsx   # /dashboard
    ├── _app.orders.tsx      # /orders
    ├── _app.products.tsx    # /products
    └── _app.users.tsx       # /users
```

**Convenção de imports cross-feature:**

ESLint bloqueia imports entre features (`orders → products`, `products → orders`). Componentes genuinamente compartilhados vivem em `shared/`. A regra garante que domínios permaneçam desacoplados conforme o projeto cresce.

---

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5.8 | Tipagem estática |
| TanStack Router | 1.x | Roteamento file-based com type-safety |
| TanStack Query | 5.x | Cache e sincronização de estado servidor |
| TanStack Start | 1.x | Meta-framework SSR/edge |
| React Hook Form | 7.x | Formulários performáticos |
| Zod | 3.x | Validação de schemas (client-side) |
| shadcn/ui + Radix UI | latest | Componentes acessíveis |
| Tailwind CSS | 4.x | Estilos utilitários |
| Recharts | 2.x | Gráficos do dashboard |
| Sonner | 2.x | Toasts com ações (undo delete) |
| Axios | 1.x | Cliente HTTP (via `src/lib/api.ts`) |
| Lucide React | latest | Ícones |
| Vite | 7.x | Build tool |
| Bun | latest | Runtime e gerenciador de pacotes |

---

## Como rodar localmente

### Opção 1 — Docker Compose (recomendado)

Sobe backend + banco + frontend com um único comando a partir da raiz do monorepo:

```bash
git clone https://github.com/WiltonReis/order-system-frontend.git
cd order-system
docker compose up --build
```

Frontend disponível em `http://localhost:3000`.

---

### Opção 2 — Execução direta

**Pré-requisitos:** [Bun](https://bun.sh) instalado.

```bash
# Clone o repositório
git clone https://github.com/WiltonReis/order-system-frontend.git
cd order-system-frontend

# Instale as dependências
bun install

# Configure as variáveis de ambiente
cp .env.example .env.development
# Edite .env.development com a URL do backend

# Inicie o servidor de desenvolvimento
bun run dev
```

Acesse `http://localhost:3000`.

> O backend precisa estar rodando. Consulte as instruções em [order-system-backend](https://github.com/WiltonReis/order-system-backend) para subir localmente.

---

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API REST do backend | `http://localhost:8080` |

Crie `.env.development` para desenvolvimento local:

```env
VITE_API_URL=http://localhost:8080
```

---

## Estrutura de features

Cada domínio segue o mesmo padrão interno:

```
features/<domain>/
├── api/          # Funções de chamada à API + mapeamento de DTOs
├── components/   # Componentes React do domínio
├── hooks/        # React Query hooks (queries e mutations)
└── schemas/      # Schemas Zod para formulários
```

**Fluxo de dados:**

```
Backend API
    ↓
api/<domain>Service.ts   ← mapeia DTO backend → tipo de domínio
    ↓
hooks/use<Domain>.ts     ← React Query (cache, loading, error)
    ↓
components/*.tsx         ← UI — nunca chama API diretamente
```

O backend é a fonte da verdade. O frontend nunca expõe ou persiste entidades brutas — sempre mapeia via service.

---

## Decisões técnicas

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| TanStack Router (file-based) | React Router v7 | Type-safety nativa nas rotas sem configuração extra; `beforeLoad` para guards de autenticação |
| TanStack Query para estado servidor | useState + useEffect | Cache automático, retry, refetch on focus e invalidação granular por query key |
| Feature-sliced (`features/<domain>/`) | Flat `components/` e `hooks/` | Desacoplamento por domínio; ESLint bloqueia imports cross-feature; escala sem reorganização |
| shadcn/ui (copy-paste, não dependência) | Biblioteca de UI opaca | Componentes totalmente controláveis e tematizáveis via Tailwind sem sobrescritas de CSS |
| Soft-delete com toast "Desfazer" | Confirmação modal | UX moderna (Gmail, Linear); reversível por 5s sem interromper o fluxo |
| Cloudflare Workers (SSR/edge) | SPA estática em CDN | TanStack Start suporta SSR/edge nativamente; deploy direto com `wrangler deploy` |
| Bun como runtime e package manager | npm / yarn | Instalação e build significativamente mais rápidos; compatível com o ecossistema Node |

---

## Backend

- **Repositório:** [github.com/WiltonReis/order-system-backend](https://github.com/WiltonReis/order-system-backend)
- **Stack:** Java 21, Spring Boot 3.2, PostgreSQL 16, Flyway, JWT, Testcontainers
- **Deploy:** Fly.io (Docker, região São Paulo)
- **API docs:** Swagger UI em `/swagger-ui.html` em qualquer instância rodando

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
