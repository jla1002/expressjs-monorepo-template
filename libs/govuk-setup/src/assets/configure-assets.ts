import path from "node:path";
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
export async function configureAssets(app: Express, env: nunjucks.Environment, options: AssetOptions): Promise<void> {
  const { viteRoot, distPath, entries } = options;
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    // Skip Vite setup if already configured (check for vite in app.locals)
    if (!app.locals.vite) {
      // Set up HMR and vite asset loading when in dev mode
      const { createServer } = await import("vite");
      viteServer = await createServer({
        server: { middlewareMode: true },
        appType: "custom",
        root: viteRoot,
      });

      app.use(viteServer.middlewares);
      app.locals.vite = viteServer;
    }
  } else {
    // Serve static assets from dist/assets in production
    app.use("/assets", express.static(path.join(distPath, "assets")));
  }

  // Register asset helpers as Nunjucks globals
  const assetHelpers = createAssetHelpers(entries, distPath);
  Object.entries(assetHelpers).forEach(([name, value]) => {
    env.addGlobal(name, value);
  });

  /**
   * Clean up Vite server on process exit
   */
  process.on("SIGTERM", async () => {
    if (viteServer) {
      await viteServer.close();
    }
  });
}
