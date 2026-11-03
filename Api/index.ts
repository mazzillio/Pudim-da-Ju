// Vercel entrypoint. Vercel's Fastify preset runs the first of app, index, server, src/app,
// src/index, src/server that imports "fastify", so this file wins over src/app.ts (which only
// exports buildApp). It exports a plain (req, res) handler instead of calling listen(): Vercel
// intercepts listen() without ever signalling "listening", so `await app.listen()` would hang
// and every request would fail. Other hosts run src/server.ts via `npm start`.
import type { IncomingMessage, ServerResponse } from "node:http";

import type { FastifyInstance } from "fastify";

import { loadEnv } from "./src/config/env.js";
import { createApp } from "./src/create-app.js";

const app: FastifyInstance = await createApp(loadEnv());
await app.ready();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  app.server.emit("request", req, res);
}
