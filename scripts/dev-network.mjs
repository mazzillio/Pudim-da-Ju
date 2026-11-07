/**
 * Runs Api, Web and Admin together, reachable from other devices on the same
 * Wi-Fi (phones, tablets). Usage, from the repo root: `npm run dev:network`.
 * Ctrl+C stops all three.
 */
import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";

/** First private IPv4 of this machine (192.168.x, 10.x, 172.16-31.x), or localhost. */
function lanIp() {
  const isPrivate = (ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal && isPrivate(address.address)) {
        return address.address;
      }
    }
  }
  return "localhost";
}

const ip = lanIp();
const ports = { api: 3333, web: 3000, admin: 5173 };

const projects = [
  {
    name: "api",
    color: 35,
    cwd: "Api",
    args: ["run", "dev"],
    // Shell env wins over Api/.env (node --env-file never overrides existing vars).
    env: { HOST: "0.0.0.0", PORT: String(ports.api), CORS_ALLOW_LAN: "true" },
  },
  {
    name: "web",
    color: 33,
    cwd: "Web",
    args: ["run", "dev", "--", "--hostname", "0.0.0.0", "--port", String(ports.web)],
    // Catalog reads happen server-side, so the Web keeps talking to the API on this machine.
    env: { API_URL: `http://localhost:${ports.api}`, NEXT_PUBLIC_SITE_URL: `http://${ip}:${ports.web}` },
  },
  {
    name: "admin",
    color: 36,
    cwd: "Admin",
    args: ["run", "dev", "--", "--host", "0.0.0.0", "--port", String(ports.admin)],
    // The panel calls the API from the browser, so a phone needs this machine's IP, not localhost.
    // Vite gives shell env priority over Admin/.env.
    env: { VITE_API_URL: `http://${ip}:${ports.api}`, VITE_STORE_URL: `http://${ip}:${ports.web}` },
  },
];

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];
let stopping = false;

function prefixed(name, color, stream, target) {
  const label = `\x1b[${color}m[${name.padEnd(5)}]\x1b[0m `;
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) target.write(`${label}${line}\n`);
  });
  stream.on("end", () => buffer && target.write(`${label}${buffer}\n`));
}

function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    // npm doesn't always forward signals, so stop the whole process group (vite, next, tsx).
    try {
      if (process.platform === "win32") child.kill("SIGTERM");
      else process.kill(-child.pid, "SIGTERM");
    } catch {
      // Already gone.
    }
  }
  setTimeout(() => process.exit(code), 1500).unref();
}

for (const project of projects) {
  const child = spawn(npm, project.args, {
    cwd: new URL(`../${project.cwd}/`, import.meta.url),
    env: { ...process.env, FORCE_COLOR: "1", ...project.env },
    stdio: ["ignore", "pipe", "pipe"],
    // Own process group, so stopAll can take down npm and everything it started.
    detached: process.platform !== "win32",
  });
  prefixed(project.name, project.color, child.stdout, process.stdout);
  prefixed(project.name, project.color, child.stderr, process.stderr);
  child.on("exit", (code) => {
    if (stopping) return;
    console.error(`\n[${project.name}] saiu com código ${code}; parando os outros.`);
    stopAll(code ?? 1);
  });
  children.push(child);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
process.on("SIGHUP", () => stopAll(0));

console.log(`
  Pudim da Ju na rede (${ip}):
    Loja   http://${ip}:${ports.web}
    Admin  http://${ip}:${ports.admin}
    API    http://${ip}:${ports.api}/docs
`);
