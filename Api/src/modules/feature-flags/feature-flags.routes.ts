import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  featureFlagsResponseSchema,
  updateFeatureFlagsBodySchema,
} from "./feature-flags.schemas.js";
import type { FeatureFlagsService } from "./feature-flags.service.js";

export interface FeatureFlagsRoutesOptions {
  featureFlagsService: FeatureFlagsService;
}

export const featureFlagsRoutes: FastifyPluginAsyncZod<FeatureFlagsRoutesOptions> = async (
  app,
  { featureFlagsService },
) => {
  // Public: the storefront reads the flags without a token.
  app.get(
    "/",
    {
      schema: {
        tags: ["feature-flags"],
        summary: "Lista feature flags",
        response: { 200: featureFlagsResponseSchema },
      },
    },
    async () => featureFlagsService.get(),
  );

  app.patch(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["feature-flags"],
        security: [{ bearerAuth: [] }],
        summary: "Liga ou desliga feature flags",
        body: updateFeatureFlagsBodySchema,
        response: { 200: featureFlagsResponseSchema },
      },
    },
    async (request) => featureFlagsService.update(request.body),
  );
};
