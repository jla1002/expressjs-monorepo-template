import * as appInsights from "applicationinsights";
import winston from "winston";
import type { Request, Response } from "express";

export interface TrackRequestOptions {
  name: string;
  url: string;
  duration: number;
  resultCode: number;
  success: boolean;
  properties?: Record<string, any>;
}

export class MonitoringService {
  private client: appInsights.TelemetryClient | null = null;
  private logger: winston.Logger;

  constructor(connectionString?: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    });

    if (connectionString) {
      try {
        appInsights
          .setup(connectionString)
          .setAutoDependencyCorrelation(true)
          .setAutoCollectRequests(true)
          .setAutoCollectPerformance(true, true)
          .setAutoCollectExceptions(true)
          .setAutoCollectDependencies(true)
          .setAutoCollectConsole(true, true)
          .setUseDiskRetryCaching(true)
          .setSendLiveMetrics(false)
          .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
          .start();

        this.client = appInsights.defaultClient;
        this.logger.info("Application Insights initialized");
      } catch (error) {
        this.logger.error("Failed to initialize Application Insights", error);
      }
    }
  }

  trackRequest(options: TrackRequestOptions): void {
    if (this.client) {
      this.client.trackRequest({
        name: options.name,
        url: options.url,
        duration: options.duration,
        resultCode: options.resultCode.toString(),
        success: options.success,
        properties: options.properties,
      });
    }
  }

  trackException(error: Error, properties?: Record<string, any>): void {
    this.logger.error(error.message, { error, ...properties });

    if (this.client) {
      this.client.trackException({
        exception: error,
        properties,
      });
    }
  }

  trackEvent(name: string, properties?: Record<string, any>): void {
    this.logger.info(`Event: ${name}`, properties);

    if (this.client) {
      this.client.trackEvent({
        name,
        properties,
      });
    }
  }

  trackMetric(name: string, value: number, properties?: Record<string, any>): void {
    if (this.client) {
      this.client.trackMetric({
        name,
        value,
        properties,
      });
    }
  }

  flush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.flush({
          callback: () => resolve(),
        });
      } else {
        resolve();
      }
    });
  }

  getLogger(): winston.Logger {
    return this.logger;
  }
}
