import { createBaseViteConfig } from "@hmcts/express-govuk-starter";
import { defineConfig, mergeConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { getModulePaths } from "./src/app.js";

const modulePaths = getModulePaths();
const baseConfig = createBaseViteConfig(modulePaths);

export default defineConfig(
  mergeConfig(baseConfig, {
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
