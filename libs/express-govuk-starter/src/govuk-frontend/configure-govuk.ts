import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Express, NextFunction, Request, Response } from "express";
import nunjucks from "nunjucks";
import type { AssetOptions } from "../assets/assets.js";
import { configureAssets } from "../assets/configure-assets.js";
import { currencyFilter, dateFilter, govukErrorSummaryFilter, kebabCaseFilter, timeFilter } from "../nunjucks/filters/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GovukSetupOptions {
  viewPaths?: string[];
  phase?: string;
  assets?: AssetOptions;
  errorPages?: boolean;
}

export async function configureGovuk(app: Express, options: GovukSetupOptions = {}): Promise<nunjucks.Environment> {
  const { viewPaths = [], phase = "beta", assets } = options;

  const govukFrontendPath = "../../node_modules/govuk-frontend/dist";
  const govukSetupViews = path.join(__dirname, "../nunjucks/views");
  const allViewPaths = [govukFrontendPath, govukSetupViews, ...viewPaths];

  const env = nunjucks.configure(allViewPaths, {
    autoescape: true,
    express: app,
    watch: process.env.NODE_ENV === "development",
    noCache: process.env.NODE_ENV === "development",
  });

  app.set("view engine", "njk");

  addFilters(env);
  addGlobals(env, phase);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.pageUrl = req.originalUrl;
    next();
  });

  if (assets) {
    await configureAssets(app, env, assets);
  }

  return env;
}

function addFilters(env: nunjucks.Environment): void {
  env.addFilter("date", dateFilter);
  env.addFilter("time", timeFilter);
  env.addFilter("currency", currencyFilter);
  env.addFilter("kebabCase", kebabCaseFilter);
  env.addFilter("govukErrorSummary", govukErrorSummaryFilter);
}

function addGlobals(env: nunjucks.Environment, phase: string): void {
  env.addGlobal("serviceUrl", process.env.SERVICE_URL || "http://localhost:3000");
  env.addGlobal("phase", process.env.PHASE || phase);
  env.addGlobal("isProduction", process.env.NODE_ENV === "production");
}
