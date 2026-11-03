# Pudim da Ju — Painel

Painel da dona da loja (React + TypeScript + Vite), pensado para o celular.
Fala com a API em `../Api`; a loja em si continua em `../Web`.

## Rodando

```bash
cp .env.example .env      # VITE_API_URL=http://localhost:3333
npm install
npm run dev               # http://localhost:5173
```

A API precisa aceitar esta origem: `CORS_ORIGIN=http://localhost:3000,http://localhost:5173` no `Api/.env`.
Login com a conta criada pelo `npm run db:seed` da API.

## Telas

- **Meus pudins** (`/`): filtro Todos / Disponíveis / Indisponíveis e um interruptor "Disponível"
  que salva na hora (o pudim some ou volta para a loja).
- **Novo / Editar pudim** (`/pudins/novo`, `/pudins/:id`): nome, descrição, preço em reais (aceita
  `45,90`), tipo, disponibilidade e foto. Excluir pede confirmação.
- **Foto:** por enquanto é um link (`https://...`) com prévia. O upload para o Cloudflare R2 já tem o
  contrato na API (`POST /uploads/product-image`, responde 501 até ser implementado) e o tipo
  `ProductImageUpload` em `src/lib/types.ts`; quando estiver pronto, só
  `src/components/admin/product-image-field.tsx` muda.

## Como funciona

- **Stack:** React Router (rotas), TanStack Query (dados e mutações), componentes shadcn/Base UI e
  o mesmo tema da loja (`src/index.css`, cores sobrescrevíveis por `VITE_THEME_*`).
- **Sessão:** o JWT da API fica no `localStorage` (`src/lib/session.ts`). Qualquer 401 limpa o token e
  volta para o login com o aviso "Sua sessão expirou". O layout valida o token em `GET /auth/me`.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Painel em modo desenvolvimento |
| `npm run build` | Checa tipos e gera `dist/` (site estático) |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc -b` |
