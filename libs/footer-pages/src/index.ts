import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getFooterPagesDir(): string {
  return path.join(__dirname, "pages");
}

export function getFooterLocalesDir(): string {
  return path.join(__dirname, "locales");
}

export function getFooterAssetsConfig() {
  return {
    viteRoot: path.join(__dirname, "assets"),
    entries: {
      jsEntry: "js/footer-pages.ts",
      cssEntry: "css/footer-pages.scss"
    }
  };
}
