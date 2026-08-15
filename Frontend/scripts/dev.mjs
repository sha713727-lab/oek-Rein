import { spawn } from "node:child_process";

const web = spawn("npx", ["next", "dev", "--port", "3000"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

const api = spawn("npx", ["tsx", "src/server/http/start.ts"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

const shutdown = (signal) => {
  web.kill(signal);
  api.kill(signal);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
