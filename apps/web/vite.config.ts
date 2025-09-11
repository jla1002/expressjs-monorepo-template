import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createBaseViteConfig } from "@hmcts/express-govuk-starter";
import { glob } from "glob";
import { defineConfig, mergeConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const baseConfig = createBaseViteConfig();

// Get all module paths (at build time, so always src/)
const libRoots = glob.sync(resolve(__dirname, "../../libs/*/src"));
const modulePaths = [__dirname, ...libRoots];

// Build entries for all modules that have assets
const entries: Record<string, string> = {};
for (const modulePath of modulePaths) {
  const assetsPath = resolve(modulePath, modulePath.endsWith("/src") ? "assets" : "src/assets");

  if (existsSync(assetsPath)) {
    const jsFiles = glob.sync(resolve(assetsPath, "js/*.ts"));
    const cssFiles = glob.sync(resolve(assetsPath, "css/*.scss"));
    const moduleAssets = [...jsFiles, ...cssFiles];

    for (const asset of moduleAssets) {
      // Extract module name
      const pathParts = modulePath.split("/");
      const moduleName = modulePath.includes("/libs/")
        ? pathParts[pathParts.length - 2] // Get lib name (e.g., "footer-pages")
        : "web"; // Main app

      const fileName = asset.split("/").pop()!;
      const baseName = fileName.replace(/\.(ts|scss)$/, "");

      // Create predictable keys - use consistent pattern for all modules
      const fileType = fileName.endsWith(".ts") ? "js" : "css";
      const key = moduleName === "web" ? `${baseName}_${fileType}` : `${moduleName}_${baseName}_${fileType}`;
      entries[key] = asset;
    }
  }
}

export default defineConfig(
  mergeConfig(baseConfig, {
    build: {
      rollupOptions: {
        input: entries,
        output: {
          entryFileNames: (chunkInfo: any) => {
            // Use our custom keys to generate consistent filenames
            const name = chunkInfo.name;
            return `js/${name}-[hash].js`;
          },
          chunkFileNames: "js/[name]-[hash].js",
          assetFileNames: (assetInfo: any) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "css/[name]-[hash][extname]";
            }
            return "assets/[name]-[hash][extname]";
          }
        }
      }
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: "src/pages/**/*.{njk,html}",
            dest: "../pages",
            rename: (_fileName, _fileExtension, fullPath) => {
              // Preserve directory structure by extracting path after 'src/pages/'
              const relativePath = fullPath.split("src/pages/")[1];
              return relativePath;
            }
          },
          {
            // Copy app-specific images
            src: "src/assets/images/**/*",
            dest: "images"
          }
        ]
      })
    ]
  })
);
