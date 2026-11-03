import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/** Mirrors the storefront's OrderType: in stock ("pronta-entrega") or made to order ("encomenda").
 * A product can be offered both ways, so it stores a list of types. */
export const orderTypeEnum = pgEnum("order_type", ["pronta-entrega", "encomenda"]);

export const products = pgTable("products", {
  id: uuid().primaryKey().defaultRandom(),
  slug: varchar({ length: 140 }).notNull().unique(),
  name: varchar({ length: 120 }).notNull(),
  description: text().notNull().default(""),
  /** Stored in cents to avoid floating point drift; the API exposes `price` in reais. */
  priceCents: integer().notNull(),
  imageUrl: text().notNull(),
  available: boolean().notNull().default(true),
  orderTypes: orderTypeEnum().array().notNull().default(["pronta-entrega"]),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ProductRow = typeof products.$inferSelect;
export type OrderType = (typeof orderTypeEnum.enumValues)[number];
