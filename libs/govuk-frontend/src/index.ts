export * from "./config/govuk-config.js";
export * from "./config/nunjucks-config.js";
export * from "./middleware/govuk-assets.js";

import type { Express } from "express";
import type { Environment } from "nunjucks";
import { configureGovUK as configureGovUKInternal, type GovukConfig } from "./config/govuk-config.js";

/**
 * Configure GOV.UK Frontend for an Express application
 * This is the main entry point for setting up GOV.UK Frontend
 *
 * @param app - Express application instance
 * @param nunjucksEnv - Nunjucks environment instance
 * @param config - Optional GOV.UK configuration
 */
export async function setupGovUKFrontend(app: Express, nunjucksEnv: Environment, config?: GovukConfig): Promise<void> {
  await configureGovUKInternal(app, nunjucksEnv, config);
}

export type { GovukConfig };
