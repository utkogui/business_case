# Project Business Case

Monorepo simples com duas aplicações:

- `backend`: API REST em Node.js + TypeScript + Express + Prisma + PostgreSQL
- `frontend`: SPA em React + TypeScript + Ant Design + TanStack Query

## Requisitos

- Node.js 18.20+ (recomendado 20+)
- npm 10+
- PostgreSQL 14+

## Estrutura

```txt
.
├── backend
└── frontend
```

## Setup rápido

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init_phase2
npm run prisma:seed
npm run dev
```

Credenciais iniciais (seed):

- Email: `admin@businesscase.com`
- Senha: `admin123`

Se ocorrer erro de permissao no migrate (`P1010`), garanta que o usuario do `DATABASE_URL` tenha acesso ao banco/schema:

```sql
CREATE DATABASE project_business_case;
GRANT ALL PRIVILEGES ON DATABASE project_business_case TO <seu_usuario_db>;
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Status atual

- Fase 1 concluida: estrutura, TypeScript, lint, React + Ant + Query, Express + Prisma
- Fase 2 concluida no codigo: schema completo, migration inicial e seed realista
- Fase 3 concluida: autenticacao JWT, `POST /api/auth/login`, `GET /api/auth/me`, rota protegida no frontend e logout
- Fase 4 concluida: CRUDs de areas, profissionais, projetos e alocacoes
- Fase 5 concluida: calculos centralizados de business case no backend, `GET /api/projects/:id/business-case` e `GET /api/dashboard/overview`
- Fase 6 concluida: dashboard geral com filtros e KPIs, tela detalhada de business case por projeto com graficos/tabelas
- Fase 7 concluida: refino visual, padronizacao de componentes de apresentacao, estados de loading/erro/vazio e revisao final

## Deploy

- Deploy no Render (Blueprint): veja `DEPLOY_RENDER.md`
- Arquivo de infraestrutura do Render: `render.yaml`
