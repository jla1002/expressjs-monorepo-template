import type { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonitoringService } from "../services/monitoring-service.js";
import { monitoringMiddleware, resetMonitoringService } from "./monitoring-middleware.js";

vi.mock("../services/monitoring-service.js");

describe("monitoringMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    vi.clearAllMocks();
    resetMonitoringService();

    req = {
      method: "GET",
      path: "/test",
      url: "/test?query=value",
      route: { path: "/test" },
      headers: {
        "user-agent": "Mozilla/5.0",
      },
    };

    res = {
      statusCode: 200,
      on: vi.fn(),
    };

    next = vi.fn();
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = originalEnv;
    } else {
      delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    }
  });

  it("should call next function", () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    const middleware = monitoringMiddleware();

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it("should not track when connection string is not set", () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    const middleware = monitoringMiddleware();

    middleware(req as Request, res as Response, next);

    expect(MonitoringService).not.toHaveBeenCalled();
  });

  it("should initialize monitoring service when connection string is set", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=test";

    vi.mocked(MonitoringService).mockImplementation(
      () =>
        ({
          trackRequest: vi.fn(),
          trackException: vi.fn(),
          trackEvent: vi.fn(),
          trackMetric: vi.fn(),
          flush: vi.fn(),
        }) as any,
    );

    const middleware = monitoringMiddleware();

    middleware(req as Request, res as Response, next);

    expect(MonitoringService).toHaveBeenCalledWith("InstrumentationKey=test");
  });

  it("should track request on finish event", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=test";
    const mockTrackRequest = vi.fn();
    const mockTrackException = vi.fn();

    vi.mocked(MonitoringService).mockImplementation(
      () =>
        ({
          trackRequest: mockTrackRequest,
          trackException: mockTrackException,
          trackEvent: vi.fn(),
          trackMetric: vi.fn(),
          flush: vi.fn(),
        }) as any,
    );

    const middleware = monitoringMiddleware();
    let finishCallback: () => void;

    res.on = vi.fn((event: string, callback: () => void) => {
      if (event === "finish") {
        finishCallback = callback;
      }
    }) as any;

    middleware(req as Request, res as Response, next);

    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));

    finishCallback!();

    expect(mockTrackRequest).toHaveBeenCalledWith({
      name: "GET /test",
      url: "/test?query=value",
      duration: expect.any(Number),
      resultCode: 200,
      success: true,
      properties: {
        method: "GET",
        path: "/test",
        userAgent: "Mozilla/5.0",
        tenantId: undefined,
      },
    });
  });

  it("should track request with user tenantId when available", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=test";
    const mockTrackRequest = vi.fn();

    vi.mocked(MonitoringService).mockImplementation(
      () =>
        ({
          trackRequest: mockTrackRequest,
          trackException: vi.fn(),
          trackEvent: vi.fn(),
          trackMetric: vi.fn(),
          flush: vi.fn(),
        }) as any,
    );

    const middleware = monitoringMiddleware();
    let finishCallback: () => void;

    (req as any).user = { tenantId: "tenant-123" };

    res.on = vi.fn((event: string, callback: () => void) => {
      if (event === "finish") {
        finishCallback = callback;
      }
    }) as any;

    middleware(req as Request, res as Response, next);
    finishCallback!();

    expect(mockTrackRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          tenantId: "tenant-123",
        }),
      }),
    );
  });

  it("should mark request as failed for error status codes", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=test";
    const mockTrackRequest = vi.fn();

    vi.mocked(MonitoringService).mockImplementation(
      () =>
        ({
          trackRequest: mockTrackRequest,
          trackException: vi.fn(),
          trackEvent: vi.fn(),
          trackMetric: vi.fn(),
          flush: vi.fn(),
        }) as any,
    );

    const middleware = monitoringMiddleware();
    let finishCallback: () => void;

    res.statusCode = 500;
    res.on = vi.fn((event: string, callback: () => void) => {
      if (event === "finish") {
        finishCallback = callback;
      }
    }) as any;

    middleware(req as Request, res as Response, next);
    finishCallback!();

    expect(mockTrackRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        resultCode: 500,
        success: false,
      }),
    );
  });

  it("should track exceptions on error event", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=test";
    const mockTrackException = vi.fn();

    vi.mocked(MonitoringService).mockImplementation(
      () =>
        ({
          trackRequest: vi.fn(),
          trackException: mockTrackException,
          trackEvent: vi.fn(),
          trackMetric: vi.fn(),
          flush: vi.fn(),
        }) as any,
    );

    const middleware = monitoringMiddleware();
    let errorCallback: (err: Error) => void;
    const testError = new Error("Test error");

    res.on = vi.fn((event: string, callback: (err: Error) => void) => {
      if (event === "error") {
        errorCallback = callback;
      }
    }) as any;

    middleware(req as Request, res as Response, next);

    expect(res.on).toHaveBeenCalledWith("error", expect.any(Function));

    errorCallback!(testError);

    expect(mockTrackException).toHaveBeenCalledWith(testError);
  });

  it("should use fallback path when route path is not available", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=test";
    const mockTrackRequest = vi.fn();

    vi.mocked(MonitoringService).mockImplementation(
      () =>
        ({
          trackRequest: mockTrackRequest,
          trackException: vi.fn(),
          trackEvent: vi.fn(),
          trackMetric: vi.fn(),
          flush: vi.fn(),
        }) as any,
    );

    const middleware = monitoringMiddleware();
    let finishCallback: () => void;

    delete (req as any).route;

    res.on = vi.fn((event: string, callback: () => void) => {
      if (event === "finish") {
        finishCallback = callback;
      }
    }) as any;

    middleware(req as Request, res as Response, next);
    finishCallback!();

    expect(mockTrackRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "GET /test",
      }),
    );
  });

  it("should reuse existing monitoring service instance", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=test";

    vi.mocked(MonitoringService).mockImplementation(
      () =>
        ({
          trackRequest: vi.fn(),
          trackException: vi.fn(),
          trackEvent: vi.fn(),
          trackMetric: vi.fn(),
          flush: vi.fn(),
        }) as any,
    );

    const middleware = monitoringMiddleware();

    middleware(req as Request, res as Response, next);
    expect(MonitoringService).toHaveBeenCalledTimes(1);

    middleware(req as Request, res as Response, next);
    expect(MonitoringService).toHaveBeenCalledTimes(1);
  });
});
