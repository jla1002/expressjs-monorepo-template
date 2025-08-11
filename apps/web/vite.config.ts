import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/assets",
  build: {
    outDir: "../../dist/assets",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/assets/js/index.ts"),
        styles: resolve(__dirname, "src/assets/css/index.scss"),
      },
      output: {
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    sourcemap: process.env.NODE_ENV !== "production",
    minify: process.env.NODE_ENV === "production",
    manifest: true,
  },
  server: {
    middlewareMode: true,
    hmr: {
      port: 5173,
    },
  },
  base: "/assets/",
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "govuk-frontend/dist/govuk/all";`,
      },
    },
    devSourcemap: true,
  },
  resolve: {
    extensions: [".ts", ".js", ".scss", ".css"],
  },
  publicDir: false,
});
