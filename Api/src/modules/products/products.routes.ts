import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import { errorResponseSchema, idParamsSchema } from "../../shared/schemas.js";
import {
  availabilityBodySchema,
  createProductBodySchema,
  listProductsQuerySchema,
  productResponseSchema,
  slugParamsSchema,
  updateProductBodySchema,
} from "./products.schemas.js";
import type { ProductsService } from "./products.service.js";

export interface ProductsRoutesOptions {
  productsService: ProductsService;
}

const protectedRoute = { tags: ["products"], security: [{ bearerAuth: [] }] };

export const productsRoutes: FastifyPluginAsyncZod<ProductsRoutesOptions> = async (
  app,
  { productsService },
) => {
  // Public: the storefront reads the catalog without a token.
  app.get(
    "/",
    {
      schema: {
        tags: ["products"],
        summary: "Lista pudins",
        querystring: listProductsQuerySchema,
        response: { 200: z.array(productResponseSchema) },
      },
    },
    async (request) => productsService.list(request.query),
  );

  app.get(
    "/:id",
    {
      schema: {
        tags: ["products"],
        summary: "Busca pudim por id",
        params: idParamsSchema,
        response: { 200: productResponseSchema, 404: errorResponseSchema },
      },
    },
    async (request) => productsService.getById(request.params.id),
  );

  app.get(
    "/slug/:slug",
    {
      schema: {
        tags: ["products"],
        summary: "Busca pudim por slug",
        params: slugParamsSchema,
        response: { 200: productResponseSchema, 404: errorResponseSchema },
      },
    },
    async (request) => productsService.getBySlug(request.params.slug),
  );

  // Everything below changes the catalog, so it needs the store owner's token.
  app.post(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        ...protectedRoute,
        summary: "Cria pudim",
        body: createProductBodySchema,
        response: { 201: productResponseSchema, 409: errorResponseSchema },
      },
    },
    async (request, reply) => {
      const product = await productsService.create(request.body);
      return reply.status(201).send(product);
    },
  );

  app.patch(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        ...protectedRoute,
        summary: "Atualiza pudim",
        params: idParamsSchema,
        body: updateProductBodySchema,
        response: {
          200: productResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request) => productsService.update(request.params.id, request.body),
  );

  app.patch(
    "/:id/availability",
    {
      onRequest: [app.authenticate],
      schema: {
        ...protectedRoute,
        summary: "Altera disponibilidade do pudim",
        params: idParamsSchema,
        body: availabilityBodySchema,
        response: { 200: productResponseSchema, 404: errorResponseSchema },
      },
    },
    async (request) => productsService.setAvailability(request.params.id, request.body.available),
  );

  app.delete(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        ...protectedRoute,
        summary: "Remove pudim",
        params: idParamsSchema,
        response: { 204: z.null(), 404: errorResponseSchema },
      },
    },
    async (request, reply) => {
      await productsService.delete(request.params.id);
      return reply.status(204).send(null);
    },
  );
};
