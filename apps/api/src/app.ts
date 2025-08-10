import compression from "compression";
import cors from "cors";
import type { Express } from "express";
import express from "express";
import helmet from "helmet";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.json({ status: "healthy" });
  });

  app.get("/health/ready", async (_req, res) => {
    try {
      res.json({ status: "ready" });
    } catch {
      res.status(503).json({ status: "not ready" });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
