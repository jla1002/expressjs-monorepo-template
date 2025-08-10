export * from "./middleware/authenticate.js";

import type { Express } from "express";
import type { AuthenticatedRequest } from "./middleware/authenticate.js";

export type { AuthenticatedRequest };
