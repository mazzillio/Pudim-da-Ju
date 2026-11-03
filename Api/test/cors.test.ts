import { afterEach, describe, expect, it } from "vitest";

import { buildTestApp } from "./helpers/build-test-app.js";

let ctx: Awaited<ReturnType<typeof buildTestApp>>;

afterEach(async () => {
  await ctx.app.close();
});

async function allowedOrigin(origin: string) {
  const response = await ctx.app.inject({ method: "GET", url: "/health", headers: { origin } });
  return response.headers["access-control-allow-origin"];
}

describe("CORS", () => {
  it("only allows the configured origins by default", async () => {
    ctx = await buildTestApp();

    expect(await allowedOrigin("http://localhost:3000")).toBe("http://localhost:3000");
    expect(await allowedOrigin("http://192.168.0.10:5173")).toBeUndefined();
  });

  it.each([
    "http://192.168.0.10:5173",
    "http://10.0.0.5:3000",
    "http://172.20.1.2:5173",
    "http://notebook-da-ju.local:5173",
  ])("allows the LAN origin %s when corsAllowLan is on", async (origin) => {
    ctx = await buildTestApp({}, { corsAllowLan: true });

    expect(await allowedOrigin(origin)).toBe(origin);
  });

  it.each(["https://example.com", "http://172.32.0.1:5173", "http://192.168.0.10.evil.com"])(
    "still rejects the public origin %s when corsAllowLan is on",
    async (origin) => {
      ctx = await buildTestApp({}, { corsAllowLan: true });

      expect(await allowedOrigin(origin)).toBeUndefined();
    },
  );
});
