import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Express } from "express";
import nunjucks from "nunjucks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function configureNunjucks(app: Express): nunjucks.Environment {
  const viewPaths = [
    path.join(__dirname, "../../../../apps/web/src/views"),
    path.join(__dirname, "../../../../libs/*/src/views"),
    path.join(__dirname, "../../views"),
  ];

  const env = nunjucks.configure(viewPaths, {
    autoescape: true,
    express: app,
    watch: process.env.NODE_ENV === "development",
    noCache: process.env.NODE_ENV === "development",
  });

  app.set("view engine", "njk");

  addFilters(env);
  addGlobals(env);

  return env;
}

function addFilters(env: nunjucks.Environment): void {
  env.addFilter("date", (value: Date | string, format?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (format === "short") {
      return date.toLocaleDateString("en-GB");
    }
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  });

  env.addFilter("time", (value: Date | string) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  env.addFilter("currency", (value: number) => {
    if (typeof value !== "number") return "";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(value);
  });

  env.addFilter("kebabCase", (value: string) => {
    if (!value) return "";
    return value
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  });
}

function addGlobals(env: nunjucks.Environment): void {
  env.addGlobal("serviceUrl", process.env.SERVICE_URL || "http://localhost:3000");
}
