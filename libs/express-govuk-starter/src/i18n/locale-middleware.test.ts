import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { localeMiddleware, translationMiddleware } from "./locale-middleware.js";

describe("localeMiddleware", () => {
  it("should set locale from query parameter", () => {
    const middleware = localeMiddleware();
    const req = {
      query: { lng: "cy" },
      session: {},
      cookies: {},
    } as unknown as Request;
    const res = {
      locals: {},
      cookie: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(req.session.locale).toBe("cy");
    expect(res.locals.locale).toBe("cy");
    expect(res.locals.otherLocale).toBe("en");
    expect(next).toHaveBeenCalled();
  });

  it("should use session locale when no query param", () => {
    const middleware = localeMiddleware();
    const req = {
      query: {},
      session: { locale: "cy" },
      cookies: {},
    } as unknown as Request;
    const res = {
      locals: {},
      cookie: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.locals.locale).toBe("cy");
    expect(res.locals.otherLocale).toBe("en");
    expect(next).toHaveBeenCalled();
  });

  it("should use cookie locale when no query or session", () => {
    const middleware = localeMiddleware();
    const req = {
      query: {},
      session: {},
      cookies: { locale: "cy" },
    } as unknown as Request;
    const res = {
      locals: {},
      cookie: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.locals.locale).toBe("cy");
    expect(res.locals.otherLocale).toBe("en");
    expect(next).toHaveBeenCalled();
  });

  it("should default to en when no locale specified", () => {
    const middleware = localeMiddleware();
    const req = {
      query: {},
      session: {},
      cookies: {},
    } as unknown as Request;
    const res = {
      locals: {},
      cookie: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.locals.locale).toBe("en");
    expect(res.locals.otherLocale).toBe("cy");
    expect(next).toHaveBeenCalled();
  });

  it("should reject unsupported locales", () => {
    const middleware = localeMiddleware();
    const req = {
      query: { lng: "fr" },
      session: {},
      cookies: {},
    } as unknown as Request;
    const res = {
      locals: {},
      cookie: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.locals.locale).toBe("en");
    expect(next).toHaveBeenCalled();
  });
});

describe("translationMiddleware", () => {
  const translations = {
    en: {
      welcome: "Welcome",
      navigation: {
        home: "Home",
      },
      language: {
        switch: "Cymraeg",
      },
    },
    cy: {
      welcome: "Croeso",
      navigation: {
        home: "Hafan",
      },
      language: {
        switch: "English",
      },
    },
  };

  it("should inject English translations into res.locals", () => {
    const middleware = translationMiddleware(translations);
    const req = {} as Request;
    const res = {
      locals: { locale: "en" },
    } as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.locals.welcome).toBe("Welcome");
    expect(res.locals.navigation.home).toBe("Home");
    expect(res.locals.languageToggle.link).toBe("?lng=cy");
    expect(res.locals.languageToggle.text).toBe("Cymraeg");
    expect(next).toHaveBeenCalled();
  });

  it("should inject Welsh translations into res.locals", () => {
    const middleware = translationMiddleware(translations);
    const req = {} as Request;
    const res = {
      locals: { locale: "cy" },
    } as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.locals.welcome).toBe("Croeso");
    expect(res.locals.navigation.home).toBe("Hafan");
    expect(res.locals.languageToggle.link).toBe("?lng=en");
    expect(res.locals.languageToggle.text).toBe("English");
    expect(next).toHaveBeenCalled();
  });

  it("should handle missing locale gracefully", () => {
    const middleware = translationMiddleware(translations);
    const req = {} as Request;
    const res = {
      locals: {},
    } as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.locals.welcome).toBe("Welcome");
    expect(res.locals.languageToggle.link).toBe("?lng=cy");
    expect(next).toHaveBeenCalled();
  });
});
