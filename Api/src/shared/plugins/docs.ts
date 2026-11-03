import fastifySwagger from "@fastify/swagger";
import scalarApiReference from "@scalar/fastify-api-reference";
import type { FastifyInstance } from "fastify";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

/** OpenAPI spec generated from the route zod schemas, rendered by Scalar at /docs. */
export async function registerDocs(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Pudim da Ju API",
        description: "Catálogo de pudins e autenticação da dona da loja.",
        version: "0.1.0",
      },
      tags: [
        { name: "auth", description: "Login da dona da loja" },
        { name: "products", description: "Catálogo de pudins" },
        {
          name: "uploads",
          description: "Upload de fotos (Cloudflare R2) — contrato, ainda não implementado",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(scalarApiReference, { routePrefix: "/docs" });
}
