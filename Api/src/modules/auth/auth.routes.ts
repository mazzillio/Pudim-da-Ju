import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { errorResponseSchema } from "../../shared/schemas.js";
import { loginBodySchema, loginResponseSchema, userResponseSchema } from "./auth.schemas.js";
import type { AuthService } from "./auth.service.js";

export interface AuthRoutesOptions {
  authService: AuthService;
}

export const authRoutes: FastifyPluginAsyncZod<AuthRoutesOptions> = async (
  app,
  { authService },
) => {
  app.post(
    "/login",
    {
      schema: {
        tags: ["auth"],
        summary: "Login com email e senha",
        body: loginBodySchema,
        response: { 200: loginResponseSchema, 401: errorResponseSchema },
      },
    },
    async (request) => {
      const user = await authService.validateCredentials(request.body);
      const token = await app.jwt.sign({ sub: user.id, email: user.email });
      return { token, user };
    },
  );

  app.get(
    "/me",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["auth"],
        summary: "Usuário logado",
        security: [{ bearerAuth: [] }],
        response: { 200: userResponseSchema, 401: errorResponseSchema },
      },
    },
    async (request) => authService.getProfile(request.user.sub),
  );
};
