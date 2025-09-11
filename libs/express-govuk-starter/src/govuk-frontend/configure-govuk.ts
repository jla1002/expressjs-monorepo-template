import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Express, NextFunction, Request, Response } from "express";
import { glob } from "glob";
import nunjucks from "nunjucks";
import type { AssetOptions } from "../assets/assets.js";
import { configureAssets } from "../assets/configure-assets.js";
import { localeMiddleware, renderInterceptorMiddleware, translationMiddleware } from "../i18n/locale-middleware.js";
import { loadTranslationsFromMultiplePaths } from "../i18n/translation-loader.js";
import { currencyFilter, dateFilter, govukErrorSummaryFilter, kebabCaseFilter, timeFilter } from "./filters/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function configureGovuk(app: Express, paths: string[]): Promise<nunjucks.Environment> {
  // Generate configs from paths
  const configs = paths.map(getGovukConfig);
  const { mergedViewPaths, mergedAssets, mergedI18nPaths, mergedGlobals } = mergeConfigs(configs);
  const govukFrontendPath = "../../node_modules/govuk-frontend/dist";
  const govukSetupViews = path.join(__dirname, "./views");
  const cookieViews = path.join(__dirname, "../cookies/views");
  const allViewPaths = [govukFrontendPath, govukSetupViews, cookieViews, ...mergedViewPaths];

  const env = nunjucks.configure(allViewPaths, {
    autoescape: true,
    express: app,
    watch: process.env.NODE_ENV === "development",
    noCache: process.env.NODE_ENV === "development"
  });

  app.set("view engine", "njk");
  app.set("nunjucksEnv", env);

  addFilters(env);
  addGlobals(env, mergedGlobals);

  if (mergedI18nPaths.length > 0) {
    const translations = await loadTranslationsFromMultiplePaths(mergedI18nPaths);
    app.use(localeMiddleware());
    app.use(renderInterceptorMiddleware());
    app.use(translationMiddleware(translations));
  }

  // Configure assets with all configs
  if (mergedAssets.length > 0) {
    await configureAssets(app, env, mergedAssets);
  }

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.pageUrl = req.path;
    res.locals.serviceUrl = `${req.protocol}://${req.get("host")}`;
    next();
  });

  return env;
}

function addFilters(env: nunjucks.Environment): void {
  env.addFilter("date", dateFilter);
  env.addFilter("time", timeFilter);
  env.addFilter("currency", currencyFilter);
  env.addFilter("kebabCase", kebabCaseFilter);
  env.addFilter("govukErrorSummary", govukErrorSummaryFilter);
}

function addGlobals(env: nunjucks.Environment, globals: Record<string, unknown> = {}): void {
  env.addGlobal("isProduction", process.env.NODE_ENV === "production");

  Object.entries(globals).forEach(([key, value]) => {
    env.addGlobal(key, value);
  });
}

function mergeConfigs(configs: GovukSetupOptions[]): {
  mergedViewPaths: string[];
  mergedAssets: AssetOptions[];
  mergedI18nPaths: string[];
  mergedGlobals: Record<string, unknown>;
} {
  const mergedViewPaths: string[] = [];
  const mergedAssets: AssetOptions[] = [];
  const mergedI18nPaths: string[] = [];
  const mergedGlobals: Record<string, unknown> = {};

  for (const config of configs) {
    if (config.viewPath) {
      mergedViewPaths.push(config.viewPath);
    }
    if (config.assets) {
      mergedAssets.push(config.assets);
    }
    if (config.i18nContentPath) {
      mergedI18nPaths.push(config.i18nContentPath);
    }
    if (config.nunjucksGlobals) {
      Object.assign(mergedGlobals, config.nunjucksGlobals);
    }
  }

  return { mergedViewPaths, mergedAssets, mergedI18nPaths, mergedGlobals };
}

export interface GovukSetupOptions {
  viewPath?: string;
  assets?: AssetOptions;
  i18nContentPath?: string;
  nunjucksGlobals?: Record<string, unknown>;
}

export function getGovukConfig(modulePath: string): GovukSetupOptions {
  const hasPages = existsSync(modulePath + "/pages");
  const hasLocales = existsSync(modulePath + "/locales");

  if (!hasPages && !hasLocales) {
    return {};
  }

  // Only the main app (web) configures assets since it builds everything
  const isMainApp = !modulePath.includes("/libs/");
  const assets = isMainApp
    ? {
        viteRoot: modulePath + "/assets",
        distPath: modulePath.endsWith("/dist") ? modulePath : modulePath + "/dist",
        // All asset entries are created dynamically by vite config
        // We just need to provide the mapping from template keys to entry names
        entries: getAllAssetEntries(modulePath)
      }
    : undefined;

  return {
    i18nContentPath: hasLocales ? modulePath + "/locales" : undefined,
    viewPath: hasPages ? modulePath + "/pages" : undefined,
    assets
  };
}

function getAllAssetEntries(appPath: string): Record<string, string> {
  // This function returns the mapping for ALL assets built by vite
  // The keys here must match what the templates expect
  // The values don't matter as they're not used in production (manifest lookup uses keys)
  const entries: Record<string, string> = {
    // Main app assets
    index_js: "js/index.ts",
    index_css: "css/index.scss"
  };

  // Resolve to absolute path to handle running from dist
  const resolvedPath = path.resolve(appPath);
  // When running from dist, we need to go up one more level
  const isInDist = resolvedPath.includes("/dist");
  const libsPath = path.resolve(resolvedPath, isInDist ? "../../../libs" : "../../libs");

  // Always check src directories for what assets should exist
  const libSrcDirs = glob.sync(path.join(libsPath, "*/src"));

  for (const libSrcDir of libSrcDirs) {
    const libName = path.basename(path.dirname(libSrcDir)); // Get lib name (e.g., "footer-pages")
    const assetsPath = path.join(libSrcDir, "assets");

    if (existsSync(assetsPath)) {
      // Check for JS files
      const jsFiles = glob.sync(path.join(assetsPath, "js/*.ts"));
      for (const jsFile of jsFiles) {
        const baseName = path.basename(jsFile, ".ts");
        entries[`${libName}_${baseName}_js`] = `js/${baseName}.ts`;
      }

      // Check for CSS files
      const cssFiles = glob.sync(path.join(assetsPath, "css/*.scss"));
      for (const cssFile of cssFiles) {
        const baseName = path.basename(cssFile, ".scss");
        entries[`${libName}_${baseName}_css`] = `css/${baseName}.scss`;
      }
    }
  }

  return entries;
}
