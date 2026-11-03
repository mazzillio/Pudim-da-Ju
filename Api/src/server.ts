import { loadEnv } from "./config/env.js";
import { createApp } from "./create-app.js";

const env = loadEnv();
const app = await createApp(env);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    await app.close();
    process.exit(0);
  });
}

await app.listen({ host: env.HOST, port: env.PORT });
app.log.info(`API docs at http://localhost:${env.PORT}/docs`);
