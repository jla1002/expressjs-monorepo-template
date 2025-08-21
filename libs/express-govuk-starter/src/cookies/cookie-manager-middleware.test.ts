import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAcceptCookiesHandler,
  createCookieManagerMiddleware,
  createRejectCookiesHandler,
  createSavePreferencesHandler,
  parseCookiePolicy,
  setCookiePolicy,
} from "./cookie-manager-middleware.js";

describe("Cookie Manager Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      cookies: {},
      body: {},
      headers: {},
      originalUrl: "/test",
    };
    res = {
      locals: {},
      cookie: vi.fn(),
      redirect: vi.fn(),
      render: vi.fn(),
    };
    next = vi.fn();
  });

  describe("parseCookiePolicy", () => {
    it("should return empty object for undefined value", () => {
      expect(parseCookiePolicy(undefined)).toEqual({});
    });

    it("should parse valid JSON cookie policy", () => {
      const encoded = encodeURIComponent(JSON.stringify({ analytics: true }));
      expect(parseCookiePolicy(encoded)).toEqual({ analytics: true });
    });

    it("should return empty object for invalid JSON", () => {
      expect(parseCookiePolicy("invalid")).toEqual({});
    });
  });

  describe("setCookiePolicy", () => {
    it("should set cookie with encoded preferences", () => {
      setCookiePolicy(res as Response, { analytics: true });

      expect(res.cookie).toHaveBeenCalledWith(
        "cookie_policy",
        encodeURIComponent(JSON.stringify({ analytics: true })),
        expect.objectContaining({
          httpOnly: false,
          sameSite: "strict",
          maxAge: 365 * 24 * 60 * 60 * 1000,
        }),
      );
    });
  });

  describe("createCookieManagerMiddleware", () => {
    it("should set showBanner to true when no cookies are set", () => {
      const middleware = createCookieManagerMiddleware({});

      middleware(req as Request, res as Response, next);

      expect(res.locals?.cookieManager?.showBanner).toBe(true);
      expect(res.locals?.cookieManager?.cookiesAccepted).toBe(false);
      expect(next).toHaveBeenCalled();
    });

    it("should set showBanner to false when banner has been seen", () => {
      req.cookies = { cookie_banner_seen: "true" };
      const middleware = createCookieManagerMiddleware({});

      middleware(req as Request, res as Response, next);

      expect(res.locals?.cookieManager?.showBanner).toBe(false);
      expect(next).toHaveBeenCalled();
    });

    it("should parse existing cookie preferences", () => {
      const cookiePolicy = encodeURIComponent(JSON.stringify({ analytics: true }));
      req.cookies = { cookie_policy: cookiePolicy };
      const middleware = createCookieManagerMiddleware({});

      middleware(req as Request, res as Response, next);

      expect(res.locals?.cookieManager?.cookiePreferences).toEqual({ analytics: true });
      expect(res.locals?.cookieManager?.cookiesAccepted).toBe(true);
      expect(res.locals?.cookieManager?.showBanner).toBe(false);
    });
  });

  describe("createAcceptCookiesHandler", () => {
    it("should accept all categories and call onAccept callbacks", () => {
      const onAccept = vi.fn();
      const handler = createAcceptCookiesHandler({
        categories: {
          analytics: { cookies: ["_ga"] },
          preferences: { cookies: ["lang"] },
        },
        onAccept,
      });

      handler(req as Request, res as Response);

      expect(res.cookie).toHaveBeenCalledWith("cookie_policy", expect.stringContaining("analytics"), expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith("cookie_banner_seen", "true", expect.any(Object));
      expect(onAccept).toHaveBeenCalledWith("analytics");
      expect(onAccept).toHaveBeenCalledWith("preferences");
      expect(res.redirect).toHaveBeenCalledWith("/");
    });

    it("should redirect to referer when provided", () => {
      req.headers = { referer: "/previous-page" };
      const handler = createAcceptCookiesHandler({});

      handler(req as Request, res as Response);

      expect(res.redirect).toHaveBeenCalledWith("/previous-page");
    });
  });

  describe("createRejectCookiesHandler", () => {
    it("should reject all categories and call onReject callbacks", () => {
      const onReject = vi.fn();
      const handler = createRejectCookiesHandler({
        categories: {
          analytics: { cookies: ["_ga"] },
        },
        onReject,
      });

      handler(req as Request, res as Response);

      expect(onReject).toHaveBeenCalledWith("analytics");
      expect(res.redirect).toHaveBeenCalledWith("/");
    });
  });

  describe("createSavePreferencesHandler", () => {
    it("should save selected preferences", () => {
      req.body = { analytics: "on", preferences: "off" };
      const onAccept = vi.fn();
      const onReject = vi.fn();

      const handler = createSavePreferencesHandler({
        categories: {
          analytics: { cookies: ["_ga"] },
          preferences: { cookies: ["lang"] },
        },
        onAccept,
        onReject,
      });

      handler(req as Request, res as Response);

      expect(onAccept).toHaveBeenCalledWith("analytics");
      expect(onReject).toHaveBeenCalledWith("preferences");
      expect(res.redirect).toHaveBeenCalledWith("/cookies");
    });

    it("should redirect to custom preferences path", () => {
      const handler = createSavePreferencesHandler({
        preferencesPath: "/custom-cookies",
      });

      handler(req as Request, res as Response);

      expect(res.redirect).toHaveBeenCalledWith("/custom-cookies");
    });
  });
});
