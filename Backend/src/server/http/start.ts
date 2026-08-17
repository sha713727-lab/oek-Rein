import { createServer, type Server } from "node:http";

import { getEnv } from "@/lib/env";
import { loadDotEnv } from "@/lib/load-dot-env";
import { logger } from "@/lib/logger";
import { closePool, databaseHealth } from "@/server/database/pool";
import { handleApiRequest } from "@/server/http/handle-api-request";
import { pruneExpiredNonces } from "@/server/jobs/prune-nonces";
import { authService } from "@/server/services/auth/auth.service";

loadDotEnv();

const PRUNE_INTERVAL_MS = 5 * 60 * 1000;

async function main(): Promise<void> {
  const env = getEnv();
  const health = await databaseHealth();
  if (health.status !== "connected") {
    throw new Error("PostgreSQL is not reachable");
  }
  if (env.NODE_ENV === "development") {
    const admin = await authService.seedAdmin();
    logger.info({ email: admin.email }, "Seed admin synced from environment");
  }
  const server = createServer((req, res) => {
    void handleApiRequest(req, res);
  });
  server.listen(env.API_PORT, env.API_HOST, () => {
    logger.info({ host: env.API_HOST, port: env.API_PORT }, "Native HTTP API listening");
  });
  const pruneTimer = setInterval(() => {
    void pruneExpiredNonces();
  }, PRUNE_INTERVAL_MS);
  pruneTimer.unref();
  bindShutdown(server);
}

function bindShutdown(server: Server): void {
  let shuttingDown = false;
  const shutdown = (signal: string): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info({ signal }, "Graceful shutdown started");
    server.close(() => {
      void closePool().then(() => {
        process.exit(0);
      });
    });
    setTimeout(() => {
      process.exit(1);
    }, 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

void main();
