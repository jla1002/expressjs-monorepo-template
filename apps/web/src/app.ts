import path from "node:path";
import { fileURLToPath } from "node:url";
import { configureGovUK } from "@hmcts/govuk-frontend";
import { configureNunjucks } from "@hmcts/nunjucks";
import compression from "compression";
import cookieParser from "cookie-parser";
import type { Express } from "express";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import * as IndexPage from "./pages/index/index.js";
import { createAssetHelpers } from "./utils/assets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp(): Promise<Express> {
  const app = express();

  // Set up HMR and vite asset loading when in dev mode
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
      root: path.join(__dirname, "assets"),
    });

    app.use(vite.middlewares);

    app.locals.vite = vite;
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "*.googletagmanager.com"],
          imgSrc: ["'self'", "data:", "*.google-analytics.com"],
          fontSrc: ["'self'", "data:"],
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

  // Serve static assets from dist/assets in production, Vite middleware handles dev
  if (process.env.NODE_ENV === "production") {
    app.use("/assets", express.static(path.join(__dirname, "../assets")));
  }

  const nunjucksEnv = configureNunjucks(app, [path.join(__dirname, "pages/")]);

  const assetHelpers = createAssetHelpers();
  Object.entries(assetHelpers).forEach(([name, value]) => {
    nunjucksEnv.addGlobal(name, value);
  });

  configureGovUK(app, nunjucksEnv);

  // TODO move to monitoring and add proper liveness and readiness checks
  app.get("/health", (_req, res) => {
    res.json({ status: "healthy" });
  });

  app.get("/", IndexPage.GET);

  // TODO add error handling middleware (maybe as part of govuk-frontend?)
  app.use((_req, res) => {
    res.status(404).send("<h1>404 - Page not found</h1>");
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send("<h1>500 - Something went wrong</h1>");
  });

  return app;
}
