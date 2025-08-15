import path from "node:path";
import { fileURLToPath } from "node:url";
import { healthcheck } from "@hmcts/cloud-native-platform";
import { configureGovuk, configureHelmet, configureNonce, errorHandler, notFoundHandler } from "@hmcts/express-govuk-starter";
import compression from "compression";
import cookieParser from "cookie-parser";
import type { Express } from "express";
import express from "express";
import session from "express-session";
import * as IndexPage from "./pages/index/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp(): Promise<Express> {
  const app = express();

  app.use(configureNonce());
  app.use(configureHelmet());

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
