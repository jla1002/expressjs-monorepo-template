import path from "node:path";
import { fileURLToPath } from "node:url";
import { healthcheck } from "@hmcts/cloud-native-platform";
import { configureGovuk, errorHandler, notFoundHandler } from "@hmcts/govuk-setup";
import compression from "compression";
import cookieParser from "cookie-parser";
import type { Express } from "express";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import * as IndexPage from "./pages/index/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp(): Promise<Express> {
  const app = express();

  // Configure Vite first in development for asset handling
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
      root: path.join(__dirname, "assets"),
    });
    app.use(vite.middlewares);
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "*.googletagmanager.com", process.env.NODE_ENV !== "production" && "ws://localhost:5173"].filter(Boolean) as string[],
          imgSrc: ["'self'", "data:", "*.google-analytics.com"],
          fontSrc: ["'self'", "data:"],
          connectSrc: process.env.NODE_ENV !== "production" ? ["'self'", "ws://localhost:5173"] : ["'self'"],
        },
      },
    }),
  );

  app.use(compression());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // TODO move to session package with redis set up
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "development",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 4,
      },
    }),
  );

  // Configure Nunjucks and asset helpers
  await configureGovuk(app, {
    viewPaths: [path.join(__dirname, "pages/")],
    assets: {
      viteRoot: path.join(__dirname, "assets"),
      distPath: path.join(__dirname, "../dist"),
      entries: {
        jsEntry: "js/index.ts",
        cssEntry: "css/index.scss",
      },
    },
  });

  app.use(healthcheck.configure());

  app.get("/", IndexPage.GET);

  // Error handling middleware from govuk-setup (must be last)
  app.use(notFoundHandler());
  app.use(errorHandler());

  return app;
}
