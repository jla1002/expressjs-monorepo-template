import type { Request, Response, NextFunction } from "express";
import { MonitoringService } from "../services/monitoring-service.js";

let monitoringService: MonitoringService | null = null;

export function monitoringMiddleware() {
  if (!monitoringService && process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    monitoringService = new MonitoringService(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;

      if (monitoringService) {
        monitoringService.trackRequest({
          name: `${req.method} ${req.route?.path || req.path}`,
          url: req.url,
          duration,
          resultCode: res.statusCode,
          success: res.statusCode < 400,
          properties: {
            method: req.method,
            path: req.path,
            userAgent: req.headers["user-agent"],
            tenantId: (req as any).user?.tenantId,
          },
        });
      }

      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });

    next();
  };
}
