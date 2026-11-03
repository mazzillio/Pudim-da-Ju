import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildTestApp, OWNER } from "./helpers/build-test-app.js";

let ctx: Awaited<ReturnType<typeof buildTestApp>>;

beforeEach(async () => {
  ctx = await buildTestApp();
});

afterEach(async () => {
  await ctx.app.close();
});

describe("POST /auth/login", () => {
  it("returns a token and the user for valid credentials", async () => {
    const response = await ctx.app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: OWNER.email.toUpperCase(), password: OWNER.password },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toMatchObject({ name: OWNER.name, email: OWNER.email });
    expect(body.user).not.toHaveProperty("passwordHash");
  });

  it.each([
    ["wrong password", { email: OWNER.email, password: "errada" }],
    ["unknown email", { email: "outra@pudimdaju.com.br", password: OWNER.password }],
  ])("returns the same 401 for %s", async (_, payload) => {
    const response = await ctx.app.inject({ method: "POST", url: "/auth/login", payload });

    expect(response.statusCode).toBe(401);
    expect(response.json().message).toBe("Invalid email or password");
  });

  it("returns 400 for an invalid body", async () => {
    const response = await ctx.app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "not-an-email" },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe("GET /auth/me", () => {
  it("returns 401 without a token", async () => {
    const response = await ctx.app.inject({ method: "GET", url: "/auth/me" });
    expect(response.statusCode).toBe(401);
  });

  it("returns 401 with a tampered token", async () => {
    const response = await ctx.app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: "Bearer abc.def.ghi" },
    });
    expect(response.statusCode).toBe(401);
  });

  it("returns the logged user", async () => {
    const response = await ctx.app.inject({
      method: "GET",
      url: "/auth/me",
      headers: await ctx.login(),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ email: OWNER.email });
  });
});
