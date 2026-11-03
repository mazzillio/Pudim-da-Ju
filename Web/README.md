Projeto - Pudim da Ju

Loja simples (Next.js) com pedido pelo WhatsApp.

## Rodando

O catálogo vem da API em `../Api` — suba ela primeiro (veja `Api/README.md`).

```bash
cp .env.example .env.local   # API_URL=http://localhost:3333
npm install
npm run dev
```

Na rede local, abra `http://<ip-da-máquina>:3000` em outro aparelho. O catálogo é buscado pelo
servidor do Next, então `API_URL` pode continuar `localhost` enquanto a API rodar na mesma máquina.

## Personalização

- Nome, endereço, WhatsApp, pagamento e taxa de entrega: `app/configs/store-config.ts`
- Produtos: vêm da API (`app/lib/products-api.ts`). Pudins indisponíveis somem da loja e a página deles dá 404.
- Imagens: hosts otimizados em `app/configs/image-hosts.ts` (+ `NEXT_PUBLIC_IMAGE_HOSTS`); outros hosts carregam sem otimização.
- Cores: `storeConfig.theme` (4 cores-base: `brand`, `brandForeground`, `surface`, `ink`).
  O restante da paleta (bordas, muted, accent, dark mode...) é derivado em `app/globals.css`.
  Também podem ser sobrescritas por deploy com `NEXT_PUBLIC_THEME_BRAND`,
  `NEXT_PUBLIC_THEME_BRAND_FOREGROUND`, `NEXT_PUBLIC_THEME_SURFACE` e `NEXT_PUBLIC_THEME_INK`.

O painel da dona da loja fica em `../Admin` (React + Vite).
