import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Express } from "express";
import express from "express";
import type nunjucks from "nunjucks";
import type { ViteDevServer } from "vite";
import type { AssetOptions } from "./assets.js";
import { createAssetHelpers } from "./assets.js";

let viteServer: ViteDevServer | null = null;

/**
 * Configure asset handling for development and production
 */
export async function configureAssets(app: Express, env: nunjucks.Environment, assetConfigs: AssetOptions[]): Promise<void> {
  if (assetConfigs.length === 0) return;

  const isProduction = process.env.NODE_ENV === "production";

  // Merge all asset configurations with conflict detection
  const mergedConfig = mergeAssetConfigs(assetConfigs);
  const { viteRoot, distPath, entries } = mergedConfig;

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
    // Serve static assets from all dist paths in production (they stack)
    for (const config of assetConfigs) {
      if (config.distPath) {
        app.use("/assets", express.static(path.join(config.distPath, "assets")));
      }
    }
  }

  // Register asset helpers as Nunjucks globals
  const assetHelpers = createAssetHelpers(entries, distPath);
  for (const [name, value] of Object.entries(assetHelpers)) {
    env.addGlobal(name, value);
  }

  /**
   * Clean up Vite server on process exit
   */
  process.on("SIGTERM", async () => {
    if (viteServer) {
      await viteServer.close();
    }
  });
}

function mergeAssetConfigs(configs: AssetOptions[]): {
  viteRoot: string;
  distPath: string;
  entries: Record<string, string>;
} {
  if (configs.length === 0) {
    throw new Error("No asset configurations provided");
  }

  // Use first config as base (typically main app)
  const baseConfig = configs[0];
  const mergedEntries: Record<string, string> = {};
  const keyToModule: Record<string, string> = {}; // Track which module owns each key

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const moduleName = i === 0 ? "main app" : `module ${i} (${config.viteRoot})`;

    for (const [key, value] of Object.entries(config.entries)) {
      // Check for key conflicts
      if (key in mergedEntries) {
        throw new Error(
          `Asset entry key conflict: "${key}" is defined in both ${keyToModule[key]} and ${moduleName}. ` + `Please use unique entry keys across all modules.`
        );
      }

      // Check for value conflicts (same output file)
      for (const [existingKey, existingValue] of Object.entries(mergedEntries)) {
        if (existingValue === value) {
          throw new Error(
            `Asset entry value conflict: "${value}" is used by both "${existingKey}" (${keyToModule[existingKey]}) ` +
              `and "${key}" (${moduleName}). Please use unique file paths for each entry.`
          );
        }
      }

      mergedEntries[key] = value;
      keyToModule[key] = moduleName;
    }
  }

  return {
    viteRoot: baseConfig.viteRoot,
    distPath: baseConfig.distPath,
    entries: mergedEntries
  };
}
