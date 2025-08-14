import { configure } from "./middleware/healthcheck-middleware.js";
import { down, raw, up, web } from "./services/healthcheck.js";

export * from "./middleware/monitoring-middleware.js";
export * from "./services/healthcheck.js";
export * from "./services/monitoring-service.js";

export const healthcheck = {
  configure,
  web,
  raw,
  up,
  down,
};
