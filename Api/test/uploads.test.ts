import { afterEach, describe, expect, it } from "vitest";

import type { ProductImageStorage } from "../src/modules/uploads/product-image-storage.js";
import { buildTestApp } from "./helpers/build-test-app.js";

let ctx: Awaited<ReturnType<typeof buildTestApp>>;

afterEach(async () => {
  await ctx.app.close();
});

const validBody = { contentType: "image/webp", size: 400_000 };

describe("POST /uploads/product-image", () => {
  it("requires a token", async () => {
    ctx = await buildTestApp();
    const response = await ctx.app.inject({
      method: "POST",
      url: "/uploads/product-image",
      payload: validBody,
    });
    expect(response.statusCode).toBe(401);
  });

  it.each([
    ["unsupported type", { contentType: "image/gif", size: 1000 }],
    ["file over 5 MB", { contentType: "image/jpeg", size: 6 * 1024 * 1024 }],
  ])("returns 400 for %s", async (_, payload) => {
    ctx = await buildTestApp();
    const response = await ctx.app.inject({
      method: "POST",
      url: "/uploads/product-image",
      headers: await ctx.login(),
      payload,
    });
    expect(response.statusCode).toBe(400);
  });

  it("answers 501 while no storage is configured", async () => {
    ctx = await buildTestApp();
    const response = await ctx.app.inject({
      method: "POST",
      url: "/uploads/product-image",
      headers: await ctx.login(),
      payload: validBody,
    });
    expect(response.statusCode).toBe(501);
  });

  it("returns the upload contract when a storage is plugged in", async () => {
    const fakeStorage: ProductImageStorage = {
      async createSignedUpload({ key }) {
        return {
          uploadUrl: `https://account.r2.cloudflarestorage.com/pudim-da-ju/${key}?X-Amz-Signature=x`,
          publicUrl: `https://pub-test.r2.dev/${key}`,
          key,
          expiresAt: new Date(Date.now() + 300_000),
        };
      },
      async deleteByPublicUrl() {},
    };
    ctx = await buildTestApp({ productImageStorage: fakeStorage });

    const response = await ctx.app.inject({
      method: "POST",
      url: "/uploads/product-image",
      headers: await ctx.login(),
      payload: validBody,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body).toMatchObject({ method: "PUT", headers: { "Content-Type": "image/webp" } });
    expect(body.key).toMatch(/^products\/[0-9a-f-]{36}\.webp$/);
    expect(body.publicUrl).toBe(`https://pub-test.r2.dev/${body.key}`);
  });
});
