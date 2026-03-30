# Deploy no Render

Este projeto esta preparado para deploy usando Blueprint do Render via `render.yaml`.

## 1) Preparar repositorio

1. Garanta que o projeto esta commitado e publicado no GitHub.
2. Na raiz do repositorio, confirme que existe o arquivo `render.yaml`.

## 2) Criar recursos no Render

1. Acesse [Render Dashboard](https://dashboard.render.com/).
2. Clique em **New +** -> **Blueprint**.
3. Conecte o repositorio `API-business_case`.
4. O Render vai detectar:
   - Banco Postgres: `project-business-case-db`
   - API Node: `project-business-case-api`
   - Frontend Static Site: `project-business-case-web`
5. O frontend ja possui rewrite SPA no `render.yaml` (`/* -> /index.html`) para rotas do React Router funcionarem em refresh/acesso direto.

## 3) Configurar variaveis obrigatorias

Depois da primeira criacao, configure:

### API (`project-business-case-api`)

- `CORS_ORIGIN`: URL do frontend no Render (exemplo: `https://project-business-case-web.onrender.com`)

### Frontend (`project-business-case-web`)

- `VITE_API_BASE_URL`: URL da API no Render (exemplo: `https://project-business-case-api.onrender.com`)

## 4) Deploy e migracoes

A API ja esta com:

- Build: `npm install && npm run prisma:generate && npm run build`
- Start: `npm run prisma:deploy && npm run start`

Ou seja, em cada deploy a API aplica migrations pendentes antes de iniciar.

## 5) Seed de dados (opcional)

Para ambiente de demo, rode seed uma vez:

1. No Render, abra o servico da API.
2. Abra **Shell**.
3. Execute:

```bash
npm run prisma:seed
```

Credenciais seed:

- Email: `admin@businesscase.com`
- Senha: `admin123`

## 6) Checklist rapido

- API responde em `/health`
- Login funciona no frontend
- Dashboard carrega dados
- Rotas protegidas respondem com token JWT valido
