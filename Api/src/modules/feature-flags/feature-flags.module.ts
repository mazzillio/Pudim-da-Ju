import type { FastifyInstance } from "fastify";

import type { FeatureFlagsRepository } from "./feature-flags.repository.js";
import { featureFlagsRoutes } from "./feature-flags.routes.js";
import { FeatureFlagsService } from "./feature-flags.service.js";

export async function featureFlagsModule(
  app: FastifyInstance,
  deps: { featureFlagsRepository: FeatureFlagsRepository },
) {
  const featureFlagsService = new FeatureFlagsService(deps.featureFlagsRepository);
  await app.register(featureFlagsRoutes, { prefix: "/feature-flags", featureFlagsService });
}
