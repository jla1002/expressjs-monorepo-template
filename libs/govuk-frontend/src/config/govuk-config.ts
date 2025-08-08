import type { Express } from "express";
import type { Environment } from "nunjucks";
import { serveGovukAssetsESM } from "../middleware/govuk-assets.js";
import { configureGovukNunjucks } from "./nunjucks-config.js";

export interface GovukConfig {
  serviceName?: string;
  serviceUrl?: string;
  phase?: "alpha" | "beta" | "live";
  feedbackUrl?: string;
  footerLinks?: Array<{
    text: string;
    href: string;
  }>;
  navigationItems?: Array<{
    text: string;
    href: string;
    active?: boolean;
  }>;
}

export async function configureGovUK(app: Express, nunjucksEnv: Environment, config?: GovukConfig): Promise<void> {
  // Serve GOV.UK Frontend static assets
  await serveGovukAssetsESM(app);

  // Configure Nunjucks for GOV.UK
  configureGovukNunjucks(nunjucksEnv);

  // Apply custom configuration
  if (config) {
    if (config.serviceName) {
      nunjucksEnv.addGlobal("serviceName", config.serviceName);
    }
    if (config.serviceUrl) {
      nunjucksEnv.addGlobal("serviceUrl", config.serviceUrl);
    }
    if (config.phase) {
      nunjucksEnv.addGlobal("phase", config.phase);
    }
    if (config.feedbackUrl) {
      nunjucksEnv.addGlobal("feedbackUrl", config.feedbackUrl);
    }
    if (config.footerLinks) {
      nunjucksEnv.addGlobal("footerLinks", config.footerLinks);
    }
    if (config.navigationItems) {
      nunjucksEnv.addGlobal("navigationItems", config.navigationItems);
    }
  }

  // Add middleware to set GOV.UK specific locals
  app.use((req, res, next) => {
    // Set current URL for active navigation
    res.locals.currentUrl = req.path;

    // Set phase banner visibility
    res.locals.showPhaseBanner = config?.phase && config.phase !== "live";

    // Set cookie banner visibility (for GDPR compliance)
    res.locals.showCookieBanner = !req.cookies?.cookieConsent;

    next();
  });
}
