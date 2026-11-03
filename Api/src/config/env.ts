import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim())),
  // Also accept any origin on a private network (192.168.x.x, 10.x.x.x, ...) so phones and other
  // machines on the same Wi-Fi can use the storefront and admin panel. Keep it off in production.
  CORS_ALLOW_LAN: z.stringbool().default(false),
});

export type Env = z.infer<typeof envSchema>;

/** Parses process.env once at startup so a misconfigured deploy fails fast with a clear message. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
