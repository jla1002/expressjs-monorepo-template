import path from "node:path";
import { fileURLToPath } from "node:url";
import { configurePropertiesVolume, healthcheck, monitoringMiddleware } from "@hmcts/cloud-native-platform";
import {
  configureCookieManager,
  configureGovuk,
  configureHelmet,
  configureNonce,
  errorHandler,
  expressSessionRedis,
  notFoundHandler
} from "@hmcts/express-govuk-starter";
import { createSimpleRouter, type MountSpec } from "@hmcts/simple-router";
import compression from "compression";
import config from "config";
import cookieParser from "cookie-parser";
import type { Express } from "express";
import express from "express";
import { glob } from "glob";
import { createClient } from "redis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getModulePaths(): string[] {
  const libDir = process.env.NODE_ENV === "production" ? "dist/" : "src/";
  const libRoots = glob.sync(path.join(__dirname, `../../../libs/*/${libDir}`));
  return [__dirname, ...libRoots];
}

export async function createApp(): Promise<Express> {
  await configurePropertiesVolume(config, { chartPath: path.join(__dirname, "../helm/values.yaml") });

  const app = express();

  app.use(compression());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(healthcheck());
  app.use(monitoringMiddleware(config.get("applicationInsights")));
  app.use(configureNonce());
  app.use(configureHelmet());
  app.use(expressSessionRedis({ redisConnection: await getRedisClient() }));

  const modulePaths = getModulePaths();

  // TODO re-add globals for this app
  //     nunjucksGlobals: {
  //   gtm: config.get("gtm"),
  //   dynatrace: config.get("dynatrace")
  // }
  await configureGovuk(app, modulePaths);

  await configureCookieManager(app, {
    categories: {
      essential: ["connect.sid"],
      analytics: ["_ga", "_gid", "dtCookie", "dtSa", "rxVisitor", "rxvt"],
      preferences: ["language"]
    }
  });

  const routeMounts: MountSpec[] = modulePaths.filter((path) => glob.sync(path + "/pages/*.ts").length > 0).map((path) => ({ pagesDir: path + "/pages" }));

  app.use(await createSimpleRouter(...routeMounts));
  app.use(notFoundHandler());
  app.use(errorHandler());

  return app;
}

const getRedisClient = async () => {
  const redisClient = createClient({ url: config.get("redis.url") });
  redisClient.on("error", (err) => console.error("Redis Client Error", err));

  await redisClient.connect();
  return redisClient;
};
