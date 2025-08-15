import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { DiscoveredRoute } from "./types.js";

const VALID_SEGMENT_PATTERN = /^[a-zA-Z0-9-_]+$/;
const PARAM_PATTERN = /^\[([a-zA-Z0-9_]+)\]$/;

export function discoverRoutes(pagesDir: string): DiscoveredRoute[] {
  const routes: DiscoveredRoute[] = [];
  scanDirectory(pagesDir, pagesDir, routes);
  return routes;
}

function scanDirectory(dir: string, rootDir: string, routes: DiscoveredRoute[]): void {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, rootDir, routes);
    } else if (entry.isFile() && entry.name === "index.ts") {
      const relativePath = relative(rootDir, fullPath);
      const urlPath = filePathToUrlPath(relativePath);
      routes.push({
        relativePath,
        urlPath,
        absolutePath: fullPath,
      });
    }
  }
}

function filePathToUrlPath(filePath: string): string {
  const segments = filePath.split(sep).filter((s) => s !== "index.ts");

  if (segments.length === 0) {
    return "/";
  }

  const urlSegments = segments.map((segment) => {
    const paramMatch = segment.match(PARAM_PATTERN);
    if (paramMatch) {
      return `:${paramMatch[1]}`;
    }

    if (!VALID_SEGMENT_PATTERN.test(segment)) {
      throw new Error(`Invalid route segment: ${segment}. Must be alphanumeric with hyphens or underscores, or a parameter like [id]`);
    }

    return segment;
  });

  return `/${urlSegments.join("/")}`;
}

export function sortRoutes(routes: DiscoveredRoute[]): DiscoveredRoute[] {
  return [...routes].sort((a, b) => {
    const aSegments = a.urlPath.split("/").filter(Boolean);
    const bSegments = b.urlPath.split("/").filter(Boolean);

    const aParams = aSegments.filter((s) => s.startsWith(":")).length;
    const bParams = bSegments.filter((s) => s.startsWith(":")).length;

    if (aParams !== bParams) {
      return aParams - bParams;
    }

    if (aSegments.length !== bSegments.length) {
      return aSegments.length - bSegments.length;
    }

    for (let i = 0; i < aSegments.length; i++) {
      const aIsParam = aSegments[i].startsWith(":");
      const bIsParam = bSegments[i].startsWith(":");

      if (aIsParam !== bIsParam) {
        return aIsParam ? 1 : -1;
      }
    }

    return a.urlPath.localeCompare(b.urlPath);
  });
}
