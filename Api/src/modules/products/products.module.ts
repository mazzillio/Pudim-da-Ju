import type { FastifyInstance } from "fastify";

import type { ProductsRepository } from "./products.repository.js";
import { productsRoutes } from "./products.routes.js";
import { ProductsService } from "./products.service.js";

export async function productsModule(
  app: FastifyInstance,
  deps: { productsRepository: ProductsRepository },
) {
  const productsService = new ProductsService(deps.productsRepository);
  await app.register(productsRoutes, { prefix: "/products", productsService });
}
