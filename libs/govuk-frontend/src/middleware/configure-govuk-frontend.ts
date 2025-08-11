import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Express, NextFunction, Request, Response } from "express";
import type { Environment } from "nunjucks";
import { govukErrorSummary } from "../filters/error-summary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function configureGovUK(app: Express, nunjucksEnv: Environment): Promise<void> {
  nunjucksEnv.addFilter("govukErrorSummary", govukErrorSummary);
  nunjucksEnv.addGlobal("phase", process.env.PHASE || "beta");

  // add the layout to view paths
  // (nunjucksEnv as any).loader.searchPaths.push(path.join(__dirname, "../layouts"));

  // add any locals used by govuk-frontend layouts
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.pageUrl = req.originalUrl;
    next();
  });
}
