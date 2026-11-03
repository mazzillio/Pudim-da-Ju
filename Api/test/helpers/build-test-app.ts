import { type AppDependencies, buildApp } from "../../src/app.js";
import { hashPassword } from "../../src/shared/password.js";
import { InMemoryProductsRepository, InMemoryUsersRepository } from "./in-memory-repositories.js";

export const OWNER = { name: "Ju", email: "ju@pudimdaju.com.br", password: "senha-super-secreta" };

export async function buildTestApp(overrides: Partial<AppDependencies> = {}) {
  const usersRepository = new InMemoryUsersRepository();
  const productsRepository = new InMemoryProductsRepository();

  await usersRepository.create({
    name: OWNER.name,
    email: OWNER.email,
    passwordHash: await hashPassword(OWNER.password),
  });

  const app = await buildApp(
    {
      jwtSecret: "test-secret-that-is-at-least-32-characters-long",
      jwtExpiresIn: "1h",
      corsOrigin: ["http://localhost:3000"],
    },
    { usersRepository, productsRepository, ...overrides },
  );

  async function login() {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: OWNER.email, password: OWNER.password },
    });
    return { authorization: `Bearer ${response.json().token}` };
  }

  return { app, usersRepository, productsRepository, login };
}
