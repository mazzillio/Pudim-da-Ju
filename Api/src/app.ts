import fastifyCors from "@fastify/cors";
import Fastify, { type FastifyServerOptions } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { authModule } from "./modules/auth/auth.module.js";
import { productsModule } from "./modules/products/products.module.js";
import type { ProductsRepository } from "./modules/products/products.repository.js";
import type { ProductImageStorage } from "./modules/uploads/product-image-storage.js";
import { uploadsModule } from "./modules/uploads/uploads.module.js";
import type { UsersRepository } from "./modules/users/users.repository.js";
import { authPlugin } from "./shared/plugins/auth.js";
import { registerDocs } from "./shared/plugins/docs.js";
import { registerErrorHandler } from "./shared/plugins/error-handler.js";

export interface AppOptions {
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string[];
  logger?: FastifyServerOptions["logger"];
}

/** Repositories are injected so tests can swap Postgres for in-memory fakes. */
export interface AppDependencies {
  usersRepository: UsersRepository;
  productsRepository: ProductsRepository;
  /** Optional until the Cloudflare R2 storage is implemented; without it, uploads answer 501. */
  productImageStorage?: ProductImageStorage;
}

export async function buildApp(options: AppOptions, deps: AppDependencies) {
  const app = Fastify({ logger: options.logger ?? false }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandler(app);

  await app.register(fastifyCors, {
    origin: options.corsOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(authPlugin, { secret: options.jwtSecret, expiresIn: options.jwtExpiresIn });
  await registerDocs(app);

  app.get("/health", { schema: { hide: true } }, async () => ({ status: "ok" }));

  await authModule(app, deps);
  await productsModule(app, deps);
  await uploadsModule(app, deps);

  return app;
}
