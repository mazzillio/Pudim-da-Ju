import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** On/off switches the store owner flips from the admin panel. A missing row means "off". */
export const featureFlags = pgTable("feature_flags", {
  key: varchar({ length: 60 }).primaryKey(),
  enabled: boolean().notNull().default(false),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type FeatureFlagRow = typeof featureFlags.$inferSelect;
