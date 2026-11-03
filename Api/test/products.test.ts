import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { slugify } from "../src/modules/products/products.service.js";
import { buildTestApp } from "./helpers/build-test-app.js";

let ctx: Awaited<ReturnType<typeof buildTestApp>>;
let auth: { authorization: string };

const newPudim = {
  name: "Pudim de Doce de Leite",
  description: "Inteiro, serve 8 pessoas.",
  price: 55.9,
  imageUrl: "https://picsum.photos/seed/doce-de-leite/600/600",
};

async function createProduct(payload: Record<string, unknown> = newPudim) {
  return ctx.app.inject({ method: "POST", url: "/products", headers: auth, payload });
}

beforeEach(async () => {
  ctx = await buildTestApp();
  auth = await ctx.login();
});

afterEach(async () => {
  await ctx.app.close();
});

describe("slugify", () => {
  it("removes accents and symbols", () => {
    expect(slugify("  Pudim de Côco & Limão! ")).toBe("pudim-de-coco-limao");
  });
});

describe("public catalog", () => {
  it("lists products without a token and filters by availability and order type", async () => {
    await createProduct();
    await createProduct({ ...newPudim, name: "Babydim", orderType: "encomenda", available: false });

    const all = await ctx.app.inject({ method: "GET", url: "/products" });
    expect(all.statusCode).toBe(200);
    expect(all.json()).toHaveLength(2);

    const available = await ctx.app.inject({ method: "GET", url: "/products?available=true" });
    expect(available.json().map((p: { name: string }) => p.name)).toEqual([newPudim.name]);

    const encomenda = await ctx.app.inject({ method: "GET", url: "/products?orderType=encomenda" });
    expect(encomenda.json().map((p: { name: string }) => p.name)).toEqual(["Babydim"]);
  });

  it("gets a product by id and by slug", async () => {
    const created = (await createProduct()).json();

    const byId = await ctx.app.inject({ method: "GET", url: `/products/${created.id}` });
    expect(byId.json()).toMatchObject({ id: created.id });

    const bySlug = await ctx.app.inject({
      method: "GET",
      url: "/products/slug/pudim-de-doce-de-leite",
    });
    expect(bySlug.json()).toMatchObject({ id: created.id });
  });

  it("returns 404 for a missing product and 400 for a malformed id", async () => {
    const missing = await ctx.app.inject({ method: "GET", url: `/products/${randomUUID()}` });
    expect(missing.statusCode).toBe(404);

    const malformed = await ctx.app.inject({ method: "GET", url: "/products/123" });
    expect(malformed.statusCode).toBe(400);
  });
});

describe("POST /products", () => {
  it("requires a token", async () => {
    const response = await ctx.app.inject({ method: "POST", url: "/products", payload: newPudim });
    expect(response.statusCode).toBe(401);
    expect(ctx.productsRepository.items).toHaveLength(0);
  });

  it("creates a product with defaults, generated slug and price stored in cents", async () => {
    const response = await createProduct();

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      slug: "pudim-de-doce-de-leite",
      price: 55.9,
      available: true,
      orderType: "pronta-entrega",
    });
    expect(ctx.productsRepository.items[0]?.priceCents).toBe(5590);
  });

  it("returns 409 for a duplicated slug", async () => {
    await createProduct();
    const response = await createProduct();
    expect(response.statusCode).toBe(409);
  });

  it.each([
    ["negative price", { ...newPudim, price: -1 }],
    ["invalid image url", { ...newPudim, imageUrl: "foto.jpg" }],
    ["unknown order type", { ...newPudim, orderType: "delivery" }],
    ["missing name", { ...newPudim, name: "" }],
  ])("returns 400 for %s", async (_, payload) => {
    const response = await createProduct(payload);
    expect(response.statusCode).toBe(400);
  });
});

describe("PATCH /products/:id", () => {
  it("updates only the sent fields", async () => {
    const created = (await createProduct()).json();

    const response = await ctx.app.inject({
      method: "PATCH",
      url: `/products/${created.id}`,
      headers: auth,
      payload: { price: 60, orderType: "encomenda" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      name: newPudim.name,
      price: 60,
      orderType: "encomenda",
    });
  });

  it("rejects an empty body", async () => {
    const created = (await createProduct()).json();
    const response = await ctx.app.inject({
      method: "PATCH",
      url: `/products/${created.id}`,
      headers: auth,
      payload: {},
    });
    expect(response.statusCode).toBe(400);
  });

  it("returns 409 when renaming the slug to one already taken", async () => {
    await createProduct({ ...newPudim, name: "Pudim Tradicional" });
    const created = (await createProduct()).json();

    const response = await ctx.app.inject({
      method: "PATCH",
      url: `/products/${created.id}`,
      headers: auth,
      payload: { slug: "pudim-tradicional" },
    });
    expect(response.statusCode).toBe(409);
  });
});

describe("PATCH /products/:id/availability", () => {
  it("toggles availability", async () => {
    const created = (await createProduct()).json();

    const response = await ctx.app.inject({
      method: "PATCH",
      url: `/products/${created.id}/availability`,
      headers: auth,
      payload: { available: false },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().available).toBe(false);
  });

  it("requires a token", async () => {
    const created = (await createProduct()).json();
    const response = await ctx.app.inject({
      method: "PATCH",
      url: `/products/${created.id}/availability`,
      payload: { available: false },
    });
    expect(response.statusCode).toBe(401);
  });
});

describe("DELETE /products/:id", () => {
  it("deletes the product, then 404s", async () => {
    const created = (await createProduct()).json();

    const first = await ctx.app.inject({
      method: "DELETE",
      url: `/products/${created.id}`,
      headers: auth,
    });
    expect(first.statusCode).toBe(204);

    const second = await ctx.app.inject({
      method: "DELETE",
      url: `/products/${created.id}`,
      headers: auth,
    });
    expect(second.statusCode).toBe(404);
  });
});

describe("docs", () => {
  it("exposes the OpenAPI spec with the product routes", async () => {
    await ctx.app.ready();
    const spec = ctx.app.swagger();
    expect(Object.keys(spec.paths ?? {})).toEqual(
      expect.arrayContaining(["/products/", "/products/{id}/availability", "/auth/login"]),
    );
  });
});
