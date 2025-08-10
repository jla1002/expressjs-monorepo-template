import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type AuthenticatedRequest, authenticate } from "./authenticate.js";

vi.mock("jsonwebtoken");

describe("authenticate middleware", () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    req = {
      headers: {},
      cookies: {},
    };

    res = {
      status: statusMock,
    };

    next = vi.fn();

    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("successful authentication", () => {
    it("should authenticate with valid Bearer token", async () => {
      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        role: "admin",
      };

      req.headers = {
        authorization: "Bearer valid-token",
      };

      vi.mocked(jwt.verify).mockReturnValue(mockPayload as any);

      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
      expect(req.user).toEqual({
        id: "user123",
        email: "test@example.com",
        role: "admin",
      });
      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should authenticate with token from cookies", async () => {
      const mockPayload = {
        userId: "user456",
        email: "cookie@example.com",
        role: "user",
      };

      req.cookies = {
        token: "cookie-token",
      };

      vi.mocked(jwt.verify).mockReturnValue(mockPayload as any);

      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith("cookie-token", "test-secret");
      expect(req.user).toEqual({
        id: "user456",
        email: "cookie@example.com",
        role: "user",
      });
      expect(next).toHaveBeenCalled();
    });

    it("should prefer Bearer token over cookie token", async () => {
      const mockPayload = {
        userId: "user789",
        email: "bearer@example.com",
        role: "admin",
      };

      req.headers = {
        authorization: "Bearer bearer-token",
      };
      req.cookies = {
        token: "cookie-token",
      };

      vi.mocked(jwt.verify).mockReturnValue(mockPayload as any);

      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith("bearer-token", "test-secret");
      expect(jwt.verify).not.toHaveBeenCalledWith("cookie-token", expect.anything());
    });

    it("should use default secret when JWT_SECRET is not set", async () => {
      delete process.env.JWT_SECRET;

      const mockPayload = {
        userId: "user111",
        email: "default@example.com",
        role: "user",
      };

      req.headers = {
        authorization: "Bearer token",
      };

      vi.mocked(jwt.verify).mockReturnValue(mockPayload as any);

      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith("token", "development-secret");
    });
  });

  describe("authentication failures", () => {
    it("should return 401 when no token is provided", async () => {
      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Authentication required" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when token is expired", async () => {
      req.headers = {
        authorization: "Bearer expired-token",
      };

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new jwt.TokenExpiredError("Token expired", new Date());
      });

      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Token expired" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", async () => {
      req.headers = {
        authorization: "Bearer invalid-token",
      };

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new jwt.JsonWebTokenError("Invalid token");
      });

      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid token" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 500 for unexpected errors", async () => {
      req.headers = {
        authorization: "Bearer token",
      };

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Authentication error" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle malformed authorization header", async () => {
      req.headers = {
        authorization: "InvalidFormat token",
      };

      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Authentication required" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle empty Bearer token", async () => {
      req.headers = {
        authorization: "Bearer ",
      };

      const middleware = authenticate();
      await middleware(req as AuthenticatedRequest, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Authentication required" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
