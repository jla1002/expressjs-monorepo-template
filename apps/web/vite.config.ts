import { createBaseViteConfig } from "@hmcts/govuk-setup";
import { resolve } from "path";
import { defineConfig, mergeConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const baseConfig = createBaseViteConfig();

export default defineConfig(
  mergeConfig(baseConfig, {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/assets/js/index.ts"),
          styles: resolve(__dirname, "src/assets/css/index.scss"),
        },
      },
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
            },
          },
        ],
      }),
    ],
  }),
);
