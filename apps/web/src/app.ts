import express from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import type { Express } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  const app = express();

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

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "development-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 4,
      },
    }),
  );

  app.use("/public", express.static(path.join(__dirname, "../public")));

  app.get("/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  app.get("/", (req, res) => {
    res.send("<h1>HMCTS Web Application</h1><p>GOV.UK Frontend integration pending...</p>");
  });

  app.use((req, res) => {
    res.status(404).send("<h1>404 - Page not found</h1>");
  });

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send("<h1>500 - Something went wrong</h1>");
  });

  return app;
}
