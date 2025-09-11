import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Express } from "express";
import express from "express";
import type nunjucks from "nunjucks";
import type { ViteDevServer } from "vite";
import type { AssetOptions } from "./assets.js";
import { createAssetHelpers } from "./assets.js";
import { existsSync } from "node:fs";
import { glob } from "glob";

let viteServer: ViteDevServer | null = null;

/**
 * Configure asset handling for development and production
 */
export async function configureAssets(app: Express, env: nunjucks.Environment, assetConfig: AssetOptions, paths: string[]): Promise<void> {
  if (!assetConfig) return;

  const isProduction = process.env.NODE_ENV === "production";
  const { viteRoot, distPath } = assetConfig;
  const entries = getEntries(paths);

  if (!isProduction) {
    // Serve GOV.UK Frontend assets in development (before Vite middleware)
    // Find the GOV.UK Frontend package reliably using import.meta.url
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const govukFrontendPath = path.join(currentDir, "../../../../node_modules/govuk-frontend/dist/govuk/assets");

    app.use("/assets/fonts", express.static(path.join(govukFrontendPath, "fonts")));
    app.use("/assets/images", express.static(path.join(govukFrontendPath, "images")));
    app.use("/assets/manifest.json", express.static(govukFrontendPath));

    // Also serve app-specific images in development
    const appImagesPath = path.join(viteRoot, "images");
    app.use("/assets/images", express.static(appImagesPath));

    // Set up HMR and vite asset loading in dev mode
    const { createServer } = await import("vite");
    viteServer = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
      root: viteRoot,
      css: {
        preprocessorOptions: {
          scss: {
            quietDeps: true,
            silenceDeprecations: ["mixed-decls"]
          }
        }
      }
    });

    app.use(viteServer.middlewares);
    app.locals.vite = viteServer;
  } else {
    app.use("/assets", express.static(path.join(distPath, "assets")));
  }

  // Register asset helpers as Nunjucks globals
  const assetHelpers = createAssetHelpers(entries, distPath);
  for (const [name, value] of Object.entries(assetHelpers)) {
    env.addGlobal(name, value);
  }

  process.on("SIGTERM", async () => {
    if (viteServer) {
      await viteServer.close();
    }
  });
}

/**
 * Scan the given paths for asset entry points (TS and SCSS files)
 */
function getEntries(paths: string[]): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const modulePath of paths) {
    const assetsPath = path.join(modulePath, "assets/");
    if (existsSync(assetsPath)) {
      const jsFiles = glob.sync(path.join(assetsPath, "js/*.ts"));
      for (const jsFile of jsFiles) {
        const baseName = path.basename(jsFile, ".ts");
        entries[`${baseName}_js`] = `js/${baseName}.ts`;
      }

      const cssFiles = glob.sync(path.join(assetsPath, "css/*.scss"));
      for (const cssFile of cssFiles) {
        const baseName = path.basename(cssFile, ".scss");
        entries[`${baseName}_css`] = `css/${baseName}.scss`;
      }
    }
  }

  return entries;
}
