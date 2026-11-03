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
  /** Also allows origins on private networks (LAN), on any port. */
  corsAllowLan?: boolean;
  logger?: FastifyServerOptions["logger"];
}

/** Repositories are injected so tests can swap Postgres for in-memory fakes. */
export interface AppDependencies {
  usersRepository: UsersRepository;
  productsRepository: ProductsRepository;
  /** Optional until the Cloudflare R2 storage is implemented; without it, uploads answer 501. */
  productImageStorage?: ProductImageStorage;
}

/** localhost, 127.x, 10.x, 172.16-31.x, 192.168.x and mDNS names (*.local), any port. */
const LAN_ORIGIN =
  /^https?:\/\/(localhost|127(\.\d{1,3}){3}|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2}|[\w-]+\.local)(:\d+)?$/;

export async function buildApp(options: AppOptions, deps: AppDependencies) {
  const app = Fastify({ logger: options.logger ?? false }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandler(app);

  await app.register(fastifyCors, {
    origin: options.corsAllowLan ? [...options.corsOrigin, LAN_ORIGIN] : options.corsOrigin,
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
