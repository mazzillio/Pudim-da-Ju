# Pudim da Ju — API

API do catálogo da loja: CRUD de pudins e login da dona da loja com JWT.

**Stack:** Fastify 5 · Drizzle ORM (Postgres) · Zod · Scalar (docs) · Vitest · Biome

## Rodando localmente

```bash
cp .env.example .env      # ajuste JWT_SECRET e ADMIN_PASSWORD
npm install
npm run db:up             # Postgres via docker-compose
npm run db:migrate        # cria as tabelas
npm run db:seed           # cria a conta da dona da loja + pudins de exemplo
npm run dev               # http://localhost:3333
```

Documentação interativa (Scalar): **http://localhost:3333/docs**

### Na rede local

Com `HOST=0.0.0.0` a API escuta em todas as interfaces e o log do boot mostra os endereços
de rede (ex.: `http://192.168.0.10:3333`). Para usar a loja e o painel de outro aparelho no mesmo Wi-Fi:

1. Na API, deixe `CORS_ALLOW_LAN=true`: aceita qualquer origem de rede privada (192.168.x.x, 10.x.x.x,
   172.16–31.x.x, `*.local`) em qualquer porta, sem listar cada IP no `CORS_ORIGIN`.
2. No `Admin/.env` e no `Web/.env`, aponte a URL da API para o IP da máquina, não `localhost`
   (para o celular, `localhost` é o próprio celular).
3. Suba os frontends escutando na rede (ex.: `vite --host`) e libere a porta 3333 no firewall, se houver.

Em produção, deixe `CORS_ALLOW_LAN=false` e liste as origens em `CORS_ORIGIN`.

## Rotas

| Método | Rota                         | Auth | Descrição                                                                                                            |
| ------ | ---------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/login`                | —    | Login com email e senha, retorna `{ token, user }`                                                                   |
| GET    | `/auth/me`                   | ✅   | Usuário logado                                                                                                       |
| GET    | `/products`                  | —    | Lista pudins (`?available=true`, `?orderType=encomenda`; produtos com os dois tipos aparecem nos dois filtros)                                                          |
| GET    | `/products/:id`              | —    | Busca por id                                                                                                         |
| GET    | `/products/slug/:slug`       | —    | Busca por slug (usado pela loja)                                                                                     |
| POST   | `/products`                  | ✅   | Cria pudim (slug gerado a partir do nome se omitido)                                                                 |
| PATCH  | `/products/:id`              | ✅   | Atualiza só os campos enviados                                                                                       |
| PATCH  | `/products/:id/availability` | ✅   | `{ "available": false }` liga/desliga o pudim                                                                        |
| DELETE | `/products/:id`              | ✅   | Remove pudim                                                                                                         |
| POST   | `/uploads/product-image`     | ✅   | **Contrato apenas**: URL assinada para enviar a foto ao Cloudflare R2. Responde `501` até o storage ser implementado |

Rotas com ✅ exigem `Authorization: Bearer <token>`.
`price` é em reais na API (ex.: `45.9`) e salvo em centavos no banco.

## Arquitetura

Modular: cada módulo tem tabela, schemas (Zod), repositório, service e rotas.
O `app.ts` recebe os repositórios por injeção, então os testes usam fakes em memória.

```
src/
  app.ts                 # monta o Fastify e registra os módulos
  create-app.ts          # monta a API com os repositórios do Postgres
  server.ts              # servidor contínuo (npm start): listen e shutdown
index.ts                 # entrada da Vercel: exporta um handler (req, res)
  config/env.ts          # validação das variáveis de ambiente
  db/                    # client, schema (drizzle-kit), migrate, seed
  shared/                # erros, hash de senha (scrypt), plugins (auth, docs, error handler)
  modules/
    auth/                # login e /me
    users/               # tabela e repositório de usuários
    products/            # CRUD de pudins
drizzle/                 # migrations SQL geradas
test/                    # testes Vitest (app.inject + repositórios em memória)
```

## Scripts

| Script                           | O que faz                                  |
| -------------------------------- | ------------------------------------------ |
| `npm run dev`                    | API em modo watch                          |
| `npm run build` / `npm start`    | Compila para `dist/` e roda                |
| `npm test`                       | Vitest                                     |
| `npm run lint` / `lint:fix`      | Biome                                      |
| `npm run typecheck`              | `tsc --noEmit`                             |
| `npm run db:generate`            | Gera migration após mudar uma `*.table.ts` |
| `npm run db:migrate` / `db:seed` | Aplica migrations / popula o banco         |
| `npm run db:up` / `db:down`      | Sobe / derruba o Postgres                  |
