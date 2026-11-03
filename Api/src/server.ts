import { buildApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { createDatabase } from "./db/client.js";
import { DrizzleProductsRepository } from "./modules/products/products.repository.js";
import { DrizzleUsersRepository } from "./modules/users/users.repository.js";

const env = loadEnv();
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
  },
);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    await app.close();
    await database.close();
    process.exit(0);
  });
}

await app.listen({ host: env.HOST, port: env.PORT });
app.log.info(`API docs at http://localhost:${env.PORT}/docs`);
