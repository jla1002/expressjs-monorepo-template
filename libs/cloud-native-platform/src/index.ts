import { configure } from "./healthcheck/healthcheck-middleware.js";
import { down, raw, up, web } from "./healthcheck/healthcheck.js";

export * from "./monitoring/monitoring-middleware.js";
export * from "./healthcheck/healthcheck.js";
export * from "./monitoring/monitoring-service.js";

export const healthcheck = {
  configure,
  web,
  raw,
  up,
  down,
};
