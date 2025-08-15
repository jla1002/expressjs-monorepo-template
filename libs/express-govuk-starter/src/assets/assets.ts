import fs from "node:fs";
import path from "node:path";

export interface AssetOptions {
  viteRoot: string;
  distPath: string;
  entries: Record<string, string>;
}

interface ManifestEntry {
  file: string;
  src?: string;
  isEntry?: boolean;
  css?: string[];
}

interface ViteManifest {
  [key: string]: ManifestEntry;
}

let manifest: ViteManifest | null = null;

/**
 * Load the Vite manifest file for production asset resolution
 */
function loadManifest(distPath: string): ViteManifest {
  if (manifest !== null) return manifest;

  const manifestPath = path.join(distPath, "assets/.vite/manifest.json");

  try {
    if (fs.existsSync(manifestPath)) {
      const manifestContent = fs.readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(manifestContent);
      return manifest!;
    }
  } catch (error) {
    console.warn("Failed to load Vite manifest:", error);
  }

  manifest = {};
  return manifest;
}

/**
 * Get the actual filename for a Vite entry point
 */
function getAssetPath(entryKey: string, distPath: string): string {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // In production, resolve hashed filename from manifest
    const manifest = loadManifest(distPath);
    const entry = manifest[`src/assets/${entryKey}`];

    entryKey = entry?.file || entryKey;
    return `/assets/${entryKey}`;
  }

  // In development, Vite serves assets at root
  return `/${entryKey}`;
}

/**
 * Create Nunjucks globals for asset paths
 */
export function createAssetHelpers(entries: Record<string, string>, distPath: string): Record<string, string> {
  const helpers: Record<string, string> = {};

  for (const [name, entryPath] of Object.entries(entries)) {
    helpers[name] = getAssetPath(entryPath, distPath);
  }

  return helpers;
}
