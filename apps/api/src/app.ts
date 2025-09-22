import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { healthcheck } from "@hmcts/cloud-native-platform";
import { createSimpleRouter, type MountSpec } from "@hmcts/simple-router";
import compression from "compression";
import cors from "cors";
import type { Express } from "express";
import express from "express";
import * as glob from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp(): Promise<Express> {
  const app = express();

  app.use(healthcheck());

  app.use(compression());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
      credentials: true
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(await createSimpleRouter(...getRouterConfigs()));

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

export function getRouterConfigs(): MountSpec[] {
  const libRoots = glob.sync(path.join(__dirname, `../../../libs/*/src/routes`));

  return [__dirname + "/routes", ...libRoots].map((path) => ({ path }));
}
