import { z } from "zod";

import { loadEnv } from "../config/env.js";
import { products } from "../modules/products/products.table.js";
import { users } from "../modules/users/users.table.js";
import { hashPassword } from "../shared/password.js";
import { createDatabase } from "./client.js";

const env = loadEnv();
const admin = z
  .object({
    ADMIN_NAME: z.string().min(1),
    ADMIN_EMAIL: z.email().transform((email) => email.toLowerCase()),
    ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),
  })
  .parse(process.env);

const { db, close } = createDatabase(env.DATABASE_URL);

// Idempotent: re-running the seed never duplicates the owner or the sample catalog.
await db
  .insert(users)
  .values({
    name: admin.ADMIN_NAME,
    email: admin.ADMIN_EMAIL,
    passwordHash: await hashPassword(admin.ADMIN_PASSWORD),
  })
  .onConflictDoNothing({ target: users.email });

await db
  .insert(products)
  .values([
    {
      slug: "tradicional",
      name: "Pudim Tradicional",
      description:
        "Pudim de leite condensado com calda de caramelo, sem furinhos. Inteiro, serve 8 pessoas.",
      priceCents: 4500,
      imageUrl: "https://picsum.photos/seed/pudim-tradicional/600/600",
      orderTypes: ["pronta-entrega", "encomenda"],
    },
    {
      slug: "tradicional-fatia",
      name: "Fatia de Pudim Tradicional",
      description: "Fatia generosa do nosso pudim de leite condensado com calda de caramelo.",
      priceCents: 900,
      imageUrl: "https://picsum.photos/seed/pudim-tradicional-fatia/600/600",
      orderTypes: ["pronta-entrega"],
    },
    {
      slug: "chocolate",
      name: "Pudim de Chocolate",
      description:
        "Pudim cremoso de chocolate meio amargo com calda de chocolate. Inteiro, serve 8 pessoas.",
      priceCents: 5200,
      imageUrl: "https://picsum.photos/seed/pudim-chocolate/600/600",
      orderTypes: ["encomenda"],
    },
    {
      slug: "doce-de-leite",
      name: "Pudim de Doce de Leite",
      description: "Pudim de doce de leite com calda de caramelo. Inteiro, serve 8 pessoas.",
      priceCents: 5500,
      imageUrl: "https://picsum.photos/seed/pudim-doce-de-leite/600/600",
      orderTypes: ["encomenda"],
    },
    {
      slug: "coco",
      name: "Pudim de Coco",
      description: "Pudim com coco fresco ralado e calda de caramelo. Inteiro, serve 8 pessoas.",
      priceCents: 5000,
      imageUrl: "https://picsum.photos/seed/pudim-coco/600/600",
      orderTypes: ["encomenda"],
    },
    {
      slug: "mini",
      name: "Mini Pudim (pote 150g)",
      description:
        "Mini pudim tradicional no pote, ideal para presentear ou para a sobremesa do dia a dia.",
      priceCents: 800,
      imageUrl: "https://picsum.photos/seed/pudim-mini/600/600",
      orderTypes: ["pronta-entrega"],
    },
    {
      slug: "babydim-25",
      name: "Babydim (25 unidades)",
      description: "Mini pudins individuais, caixa com 25 unidades.",
      priceCents: 5000,
      imageUrl: "https://picsum.photos/seed/pudim-babydim/600/600",
      orderTypes: ["encomenda"],
    },
    {
      slug: "babydim-50",
      name: "Babydim (50 unidades)",
      description: "Mini pudins individuais, meio cento.",
      priceCents: 8500,
      imageUrl: "https://picsum.photos/seed/pudim-babydim/600/600",
      orderTypes: ["encomenda"],
    },
    {
      slug: "babydim-100",
      name: "Babydim (100 unidades)",
      description: "Mini pudins individuais, um cento.",
      priceCents: 15000,
      imageUrl: "https://picsum.photos/seed/pudim-babydim/600/600",
      orderTypes: ["encomenda"],
    },
  ])
  .onConflictDoNothing({ target: products.slug });

await close();
console.log(`Seed done. Owner login: ${admin.ADMIN_EMAIL}`);
