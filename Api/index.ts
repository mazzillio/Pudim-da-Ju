// Vercel entrypoint. Vercel's Fastify preset runs the first of app, index, server, src/app,
// src/index, src/server that imports "fastify"; without this file it would pick src/app.ts, which
// only exports buildApp and never connects to the database or listens. Other hosts use `npm start`.
import "fastify";
import "./src/server.js";
