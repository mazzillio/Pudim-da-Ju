# Deploy — Pudim da Ju

Ordem recomendada: **banco → API → painel (Admin) → loja (Web)**. Cada parte depende da URL
pública da anterior.

| Parte | Onde | URL de exemplo |
|---|---|---|
| Banco | Neon (Postgres) | — |
| API (`Api/`) | Render, Railway, Fly.io... (exemplo abaixo com Render) | `https://pudim-da-ju-api.onrender.com` |
| Painel (`Admin/`) | GitHub Pages | `https://mazzillio.github.io/Pudim-da-Ju/` |
| Loja (`Web/`) | Vercel | `https://pudim-da-ju.vercel.app` |

---

## 1. Banco (Neon)

1. Crie o projeto no Neon e copie a connection string (**Connection details → Pooled connection**).
2. Troque `sslmode=require` por `sslmode=verify-full` na URL. Funciona igual hoje e evita o aviso
   do driver `pg` sobre a mudança de comportamento do `require`.
3. Crie as tabelas e a conta da dona da loja **a partir da sua máquina**, com o `Api/.env`
   apontando para o Neon:

   ```bash
   cd Api
   npm run db:migrate   # cria/atualiza as tabelas
   npm run db:seed      # conta da Ju (ADMIN_* do .env) + pudins de exemplo
   ```

   O seed só precisa rodar uma vez e não duplica nada se rodar de novo. Ele também **não atualiza**
   a senha de um usuário que já existe.

> O banco atual do projeto já está migrado e com o seed aplicado.

---

## 2. API (exemplo com Render)

A API é um servidor Node (Fastify) que precisa ficar ligado. O GitHub Pages não serve para ela.

1. No Render: **New → Web Service**, conecte o repositório `mazzillio/Pudim-da-Ju`.
2. Configure:

   | Campo | Valor |
   |---|---|
   | Root Directory | `Api` |
   | Runtime | Node |
   | Build Command | `npm ci --include=dev && npm run build && npm run db:migrate` |
   | Start Command | `npm start` |
   | Health Check Path | `/health` |

   - `--include=dev` é necessário: o `tsc` (build) e o `tsx` (migrations) são dependências de
     desenvolvimento e o npm as pula quando `NODE_ENV=production`.
   - Rodar `db:migrate` no build aplica migrations novas automaticamente a cada deploy.

3. Variáveis de ambiente (**Environment**):

   | Variável | Valor |
   |---|---|
   | `NODE_VERSION` | `24` |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | connection string do Neon (com `sslmode=verify-full`) |
   | `JWT_SECRET` | string aleatória longa: `openssl rand -hex 32` |
   | `JWT_EXPIRES_IN` | `1d` (ou `7d`, para a Ju não precisar logar todo dia) |
   | `CORS_ORIGIN` | `https://mazzillio.github.io` (origem do painel, **sem** o `/Pudim-da-Ju`) |
   | `CORS_ALLOW_LAN` | `false` |

   - `HOST` e `PORT` não precisam ser definidos: o Render injeta o `PORT` e o padrão de `HOST` já
     é `0.0.0.0`.
   - `ADMIN_*` só é usado pelo seed e não precisa estar no servidor.
   - Trocar o `JWT_SECRET` desloga todo mundo (os tokens antigos deixam de valer).

4. Depois do deploy, teste:
   - `https://SUA-API/health` → `{"status":"ok"}`
   - `https://SUA-API/docs` → documentação da API

> **Plano gratuito do Render:** o serviço "dorme" depois de ~15 min sem uso e a primeira requisição
> leva ~1 min. O painel mostra "Não foi possível falar com o servidor" nesse meio-tempo. Basta tentar
> de novo.

---

## 3. Painel (Admin) no GitHub Pages

O painel é um site estático. O workflow [`.github/workflows/deploy-admin.yml`](.github/workflows/deploy-admin.yml)
gera o build e publica no GitHub Pages a cada push na `main` que altere `Admin/`.

### Configuração (uma vez só)

1. **Repositório público.** GitHub Pages em repositório privado exige plano pago. Os `.env` estão no
   `.gitignore`, então nenhum segredo vai junto.
2. **Settings → Pages → Build and deployment → Source:** `GitHub Actions`.
3. **Settings → Secrets and variables → Actions → aba Variables → New repository variable:**

   | Variável | Valor | Obrigatória |
   |---|---|---|
   | `VITE_API_URL` | URL pública da API, ex.: `https://pudim-da-ju-api.onrender.com` | sim |
   | `VITE_STORE_URL` | URL da loja, usada no botão "Ver loja" | sim |
   | `VITE_THEME_BRAND`, `VITE_THEME_BRAND_FOREGROUND`, `VITE_THEME_SURFACE`, `VITE_THEME_INK` | cores do tema | não |

   São **Variables**, não Secrets: esses valores vão para o JavaScript do site e qualquer pessoa
   consegue vê-los no navegador. Nunca coloque senha ou chave aqui.

### Publicando

- Faça push na `main`, ou vá em **Actions → Deploy Admin (GitHub Pages) → Run workflow**.
- Ao terminar, o painel fica em `https://mazzillio.github.io/Pudim-da-Ju/`.
- Mudou alguma variável? Rode o workflow de novo: os valores entram no build, não são lidos em tempo
  de execução.

### Como funciona

- **Subcaminho:** o workflow descobre o caminho do Pages (`/Pudim-da-Ju`) e passa como `BASE_PATH`
  para o Vite e o React Router. Com domínio próprio (Settings → Pages → Custom domain), o caminho
  vira `/` automaticamente, sem mudar nada no código.
- **Recarregar em qualquer tela:** o GitHub Pages não conhece as rotas do painel, então o workflow
  copia o `index.html` como `404.html`. Um F5 em `/pudins/123` carrega o app, que abre a tela certa.

---

## 4. Loja (Web) na Vercel

1. Na Vercel: **Add New → Project**, importe o repositório e defina **Root Directory** = `Web`.
2. Variáveis de ambiente:

   | Variável | Valor |
   |---|---|
   | `API_URL` | URL pública da API |
   | `NEXT_PUBLIC_SITE_URL` | URL final da loja (usada no SEO, sitemap e links) |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | número que recebe os pedidos, ex.: `5511999999999` |
   | `NEXT_PUBLIC_IMAGE_HOSTS` | hosts extras das fotos, separados por vírgula (opcional) |

3. A loja busca os produtos pelo servidor da Vercel, não pelo navegador, então **não** precisa
   estar no `CORS_ORIGIN` da API.
4. Com a URL da loja em mãos, atualize a variável `VITE_STORE_URL` do painel e rode o workflow de novo.

---

## Checklist final

- [ ] `https://SUA-API/health` responde `{"status":"ok"}`
- [ ] `CORS_ORIGIN` da API contém a origem do painel (`https://mazzillio.github.io`)
- [ ] Variables `VITE_API_URL` e `VITE_STORE_URL` configuradas no GitHub
- [ ] Login no painel funciona e a lista de pudins aparece
- [ ] Mudar a disponibilidade de um pudim no painel reflete na loja
- [ ] Botão "Pedir pelo WhatsApp" abre o número certo

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Painel em branco, erros 404 em `/assets/...` | Pages não está como **GitHub Actions** ou o build não usou o `BASE_PATH`; rode o workflow de novo |
| "Não foi possível falar com o servidor" no login | API dormindo (plano grátis), `VITE_API_URL` errada ou faltando no build |
| Erro de CORS no console do navegador | origem do painel faltando no `CORS_ORIGIN` da API (sem path e sem `/` no final) |
| Erro *mixed content* | `VITE_API_URL` com `http://`; a API publicada precisa ser `https://` |
| "Email ou senha incorretos" com a senha certa | seed rodou com outra senha; o seed não sobrescreve usuário existente |
| Loja sem produtos | `API_URL` da Vercel errada ou API fora do ar |
