import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

/**
 * 404 Not Found handler
 * Must be added after all other routes
 */
export function notFoundHandler() {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Only handle GET/HEAD requests as 404, let others pass through
    if (_req.method === "GET" || _req.method === "HEAD") {
      res.status(404).render("errors/404");
    } else {
      next();
    }
  };
}

/**
 * General error handler
 * Must be added as the last middleware
 */
export function errorHandler(): ErrorRequestHandler {
  return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // Log the error for debugging
    console.error("Error:", err.stack || err);

    // Don't leak error details in production
    if (process.env.NODE_ENV === "production") {
      res.status(500).render("errors/500");
    } else {
      // In development, show more detailed error
      res.status(500).render("errors/500", {
        error: err.message,
        stack: err.stack,
      });
    }
  };
}
