import type { FastifyInstance } from "fastify";

import type { ProductImageStorage } from "./product-image-storage.js";
import { uploadsRoutes } from "./uploads.routes.js";
import { UploadsService } from "./uploads.service.js";

export async function uploadsModule(
  app: FastifyInstance,
  deps: { productImageStorage?: ProductImageStorage },
) {
  const uploadsService = new UploadsService(deps.productImageStorage);
  await app.register(uploadsRoutes, { prefix: "/uploads", uploadsService });
}
