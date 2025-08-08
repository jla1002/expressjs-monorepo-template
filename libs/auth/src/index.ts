export * from "./middleware/authenticate.js";
export * from "./middleware/authorize.js";
export * from "./services/auth-service.js";

import type { Express } from "express";
import type { AuthenticatedRequest } from "./middleware/authenticate.js";

export function errorHandler() {
  return (err: Error, req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Internal server error" });
  };
}

export type { AuthenticatedRequest };
