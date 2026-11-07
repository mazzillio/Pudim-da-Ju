import type { Database } from "../../db/client.js";
import { featureFlags } from "./feature-flags.table.js";

export interface FeatureFlagsRepository {
  /** Stored flags only; keys never written are absent. */
  list(): Promise<Record<string, boolean>>;
  set(key: string, enabled: boolean): Promise<void>;
}

export class DrizzleFeatureFlagsRepository implements FeatureFlagsRepository {
  constructor(private readonly db: Database) {}

  async list() {
    const rows = await this.db.select().from(featureFlags);
    return Object.fromEntries(rows.map((row) => [row.key, row.enabled]));
  }

  async set(key: string, enabled: boolean) {
    await this.db
      .insert(featureFlags)
      .values({ key, enabled })
      .onConflictDoUpdate({ target: featureFlags.key, set: { enabled, updatedAt: new Date() } });
  }
}
