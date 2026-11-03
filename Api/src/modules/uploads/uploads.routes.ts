import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { errorResponseSchema } from "../../shared/schemas.js";
import {
  createProductImageUploadBodySchema,
  productImageUploadResponseSchema,
} from "./uploads.schemas.js";
import type { UploadsService } from "./uploads.service.js";

export interface UploadsRoutesOptions {
  uploadsService: UploadsService;
}

export const uploadsRoutes: FastifyPluginAsyncZod<UploadsRoutesOptions> = async (
  app,
  { uploadsService },
) => {
  app.post(
    "/product-image",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["uploads"],
        summary: "Gera URL assinada para enviar a foto de um pudim ao Cloudflare R2",
        description:
          "Contrato pronto, implementação pendente: responde 501 até o armazenamento R2 ser configurado.",
        security: [{ bearerAuth: [] }],
        body: createProductImageUploadBodySchema,
        response: {
          201: productImageUploadResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          501: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const upload = await uploadsService.createProductImageUpload(request.body);
      return reply.status(201).send(upload);
    },
  );
};
