import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 120 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
