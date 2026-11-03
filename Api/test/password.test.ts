import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "../src/shared/password.js";

describe("password hashing", () => {
  it("verifies the original password", async () => {
    const hash = await hashPassword("pudim123");
    expect(hash).not.toContain("pudim123");
    await expect(verifyPassword("pudim123", hash)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("pudim123");
    await expect(verifyPassword("pudim124", hash)).resolves.toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("pudim123")).not.toBe(await hashPassword("pudim123"));
  });

  it("rejects a malformed stored hash", async () => {
    await expect(verifyPassword("pudim123", "not-a-hash")).resolves.toBe(false);
  });
});
