import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildTestApp } from "./helpers/build-test-app.js";

let ctx: Awaited<ReturnType<typeof buildTestApp>>;

beforeEach(async () => {
  ctx = await buildTestApp();
});

afterEach(async () => {
  await ctx.app.close();
});

describe("feature flags", () => {
  it("starts with every flag off and is public", async () => {
    const response = await ctx.app.inject({ method: "GET", url: "/feature-flags" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ freeShipping: false });
  });

  it("requires a token to change a flag", async () => {
    const response = await ctx.app.inject({
      method: "PATCH",
      url: "/feature-flags",
      payload: { freeShipping: true },
    });
    expect(response.statusCode).toBe(401);
  });

  it("turns free shipping on and off", async () => {
    const headers = await ctx.login();

    const on = await ctx.app.inject({
      method: "PATCH",
      url: "/feature-flags",
      headers,
      payload: { freeShipping: true },
    });
    expect(on.statusCode).toBe(200);
    expect(on.json()).toEqual({ freeShipping: true });

    const read = await ctx.app.inject({ method: "GET", url: "/feature-flags" });
    expect(read.json()).toEqual({ freeShipping: true });

    const off = await ctx.app.inject({
      method: "PATCH",
      url: "/feature-flags",
      headers,
      payload: { freeShipping: false },
    });
    expect(off.json()).toEqual({ freeShipping: false });
  });

  it("rejects unknown flags and empty bodies", async () => {
    const headers = await ctx.login();

    for (const payload of [{}, { somethingElse: true }]) {
      const response = await ctx.app.inject({
        method: "PATCH",
        url: "/feature-flags",
        headers,
        payload,
      });
      expect(response.statusCode).toBe(400);
    }
  });
});
