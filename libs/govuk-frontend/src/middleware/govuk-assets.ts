import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Express } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveGovukAssets(app: Express): void {
  // Find the govuk-frontend module path
  const govukFrontendPath = path.dirname(require.resolve("govuk-frontend/package.json", { paths: [process.cwd()] }));

  // Serve GOV.UK Frontend assets
  app.use("/assets", express.static(path.join(govukFrontendPath, "dist", "govuk", "assets")));

  // Serve GOV.UK Frontend JavaScript
  app.use("/javascript", express.static(path.join(govukFrontendPath, "dist", "govuk")));

  // Serve all GOV.UK Frontend files under /govuk path
  app.use("/govuk", express.static(path.join(govukFrontendPath, "dist", "govuk")));

  // Log the paths for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("GOV.UK Frontend assets served from:", path.join(govukFrontendPath, "dist", "govuk"));
  }
}

// Alternative implementation using import.meta.resolve for ES modules
export async function serveGovukAssetsESM(app: Express): Promise<void> {
  try {
    // Use dynamic import to find govuk-frontend
    const govukPath = await import.meta.resolve("govuk-frontend/dist/govuk/all.js");
    const govukDir = path.dirname(govukPath).replace("file://", "");
    const assetsDir = path.dirname(govukDir);

    // Serve GOV.UK Frontend assets
    app.use("/assets", express.static(path.join(assetsDir, "assets")));
    app.use("/javascript", express.static(assetsDir));
    app.use("/govuk", express.static(assetsDir));

    if (process.env.NODE_ENV === "development") {
      console.log("GOV.UK Frontend assets served from:", assetsDir);
    }
  } catch (error) {
    console.error("Failed to locate govuk-frontend module:", error);
    // Fallback to node_modules path
    const fallbackPath = path.join(process.cwd(), "node_modules", "govuk-frontend", "dist", "govuk");
    app.use("/govuk", express.static(fallbackPath));
  }
}
