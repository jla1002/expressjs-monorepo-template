import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
function loadManifest(): ViteManifest {
  if (manifest !== null) return manifest;

  const manifestPath = path.join(__dirname, "../assets/.vite/manifest.json");

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
function getAssetPath(entryKey: string): string {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // In production, resolve hashed filename from manifest
    const manifest = loadManifest();
    const entry = manifest[entryKey];

    entryKey = entry?.file || entryKey;
  }

  return `/assets/${entryKey}`;
}

/**
 * Create Nunjucks globals for asset paths
 */
export function createAssetHelpers() {
  return {
    jsEntry: getAssetPath("js/index.ts"),
    cssEntry: getAssetPath("css/index.scss"),
  };
}
