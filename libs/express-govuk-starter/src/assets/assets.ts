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
  name?: string;
  names?: string[];
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
function getAssetPath(entryKey: string, distPath: string, entryPath: string): string {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // In production, resolve hashed filename from manifest
    const manifest = loadManifest(distPath);

    // Find the entry by looking for entries with matching name or in names array
    let entry: any;
    for (const [_key, value] of Object.entries(manifest)) {
      // Check if the name matches
      if (value.name === entryKey) {
        entry = value;
        break;
      }
      // Check if it's in the names array (for CSS files)
      if (value.names?.some((n: string) => n.startsWith(entryKey))) {
        entry = value;
        break;
      }
    }

    if (!entry) {
      console.warn(`Asset not found in manifest: ${entryKey}`);
      return "";
    }

    const fileName = entry.file;
    return `/assets/${fileName}`;
  }

  // In development, Vite serves assets at their actual paths
  // Use the entryPath that was provided in the configuration
  return `/${entryPath}`;
}

/**
 * Create Nunjucks globals for asset paths
 */
export function createAssetHelpers(entries: Record<string, string>, distPath: string): Record<string, string> {
  const helpers: Record<string, string> = {};

  for (const [name, entryPath] of Object.entries(entries)) {
    // Pass both the name and entry path to getAssetPath
    const assetPath = getAssetPath(name, distPath, entryPath);
    helpers[name] = assetPath;
  }

  return helpers;
}
