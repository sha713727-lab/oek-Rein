import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");

const backend = spawn("npm", ["run", "start"], {
  cwd: path.join(repo, "Backend"),
  stdio: "inherit",
  shell: true,
  env: process.env,
});

const frontend = spawn("npm", ["run", "start"], {
  cwd: path.join(repo, "Frontend"),
  stdio: "inherit",
  shell: true,
  env: process.env,
});

const shutdown = (signal) => {
  backend.kill(signal);
  frontend.kill(signal);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
