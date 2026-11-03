import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { UnauthorizedError } from "../errors.js";

export interface JwtPayload {
  sub: string;
  email: string;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    /** preHandler that rejects the request with 401 unless it carries a valid Bearer token. */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AuthPluginOptions {
  secret: string;
  expiresIn: string;
}

export const authPlugin = fp<AuthPluginOptions>(async (app: FastifyInstance, options) => {
  await app.register(fastifyJwt, {
    secret: options.secret,
    sign: { expiresIn: options.expiresIn },
  });

  app.decorate("authenticate", async (request: FastifyRequest) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new UnauthorizedError("Missing or invalid token");
    }
  });
});
