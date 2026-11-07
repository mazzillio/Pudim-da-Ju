import { buildApp } from "./app.js";
import type { Env } from "./config/env.js";
import { createDatabase } from "./db/client.js";
import { DrizzleFeatureFlagsRepository } from "./modules/feature-flags/feature-flags.repository.js";
import { DrizzleProductsRepository } from "./modules/products/products.repository.js";
import { DrizzleUsersRepository } from "./modules/users/users.repository.js";

/** Production wiring (Postgres repositories), shared by the long-running server and the Vercel function. */
export async function createApp(env: Env) {
  const database = createDatabase(env.DATABASE_URL);

  const app = await buildApp(
    {
      jwtSecret: env.JWT_SECRET,
      jwtExpiresIn: env.JWT_EXPIRES_IN,
      corsOrigin: env.CORS_ORIGIN,
      corsAllowLan: env.CORS_ALLOW_LAN,
      logger: env.NODE_ENV === "production" ? true : { level: "info" },
    },
    {
      usersRepository: new DrizzleUsersRepository(database.db),
      productsRepository: new DrizzleProductsRepository(database.db),
      featureFlagsRepository: new DrizzleFeatureFlagsRepository(database.db),
    },
  );
  app.addHook("onClose", () => database.close());

  return app;
}
