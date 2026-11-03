import type { FastifyInstance } from "fastify";

import type { UsersRepository } from "../users/users.repository.js";
import { authRoutes } from "./auth.routes.js";
import { AuthService } from "./auth.service.js";

export async function authModule(app: FastifyInstance, deps: { usersRepository: UsersRepository }) {
  const authService = new AuthService(deps.usersRepository);
  await app.register(authRoutes, { prefix: "/auth", authService });
}
