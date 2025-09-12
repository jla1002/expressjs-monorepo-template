import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Return all the libs with pages/ and also this app
 */
export function getModulePaths(): string[] {
  const libRoots = glob.sync(path.join(__dirname, `../../../libs/*/src`)).filter((dir) => existsSync(path.join(dir, "pages")));

  return [__dirname, ...libRoots];
}
