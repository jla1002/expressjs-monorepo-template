import type { Express, NextFunction, Request, RequestHandler, Response } from "express";
import type { CookieManagerOptions, CookieManagerState, CookiePreferences } from "./cookie-configuration.js";
import { mergeWithDefaults } from "./cookie-configuration.js";

declare module "express-serve-static-core" {
  interface Locals {
    cookieManager?: CookieManagerState;
    cookieBannerContent?: any;
    cookieConfig?: any;
    currentUrl?: string;
  }
}

const COOKIE_POLICY_NAME = "cookie_policy";
const COOKIE_BANNER_SEEN = "cookie_banner_seen";

export function parseCookiePolicy(cookiePolicyValue: string | undefined): CookiePreferences {
  if (!cookiePolicyValue) {
    return {};
  }

  try {
    return JSON.parse(decodeURIComponent(cookiePolicyValue));
  } catch {
    return {};
  }
}

export function setCookiePolicy(res: Response, preferences: CookiePreferences): void {
  const value = encodeURIComponent(JSON.stringify(preferences));
  res.cookie(COOKIE_POLICY_NAME, value, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  });
}

export function createCookieManagerMiddleware(options: CookieManagerOptions): RequestHandler {
  const config = mergeWithDefaults(options);

  return (req: Request, res: Response, next: NextFunction) => {
    const cookiePolicy = parseCookiePolicy(req.cookies?.[COOKIE_POLICY_NAME]);
    const bannerSeen = req.cookies?.[COOKIE_BANNER_SEEN] === "true";

    const isOnCookiesPage = req.path === "/cookies" || req.path?.startsWith("/cookies/") || false;

    const state: CookieManagerState = {
      cookiesAccepted: Object.keys(cookiePolicy).length > 0,
      cookiePreferences: cookiePolicy,
      showBanner: !isOnCookiesPage && !bannerSeen && Object.keys(cookiePolicy).length === 0,
    };

    res.locals.cookieManager = state;
    res.locals.cookieBannerContent = config.cookieBannerContent;
    res.locals.cookieConfig = config;

    next();
  };
}

export function createAcceptCookiesHandler(options: CookieManagerOptions): RequestHandler {
  return (req: Request, res: Response) => {
    const preferences: CookiePreferences = {};

    if (options.categories?.analytics) {
      preferences.analytics = true;
      options.onAccept?.("analytics");
    }

    if (options.categories?.preferences) {
      preferences.preferences = true;
      options.onAccept?.("preferences");
    }

    setCookiePolicy(res, preferences);
    res.cookie(COOKIE_BANNER_SEEN, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    const returnUrl = req.body?.returnUrl || req.headers.referer || "/";
    res.redirect(returnUrl);
  };
}

export function createRejectCookiesHandler(options: CookieManagerOptions): RequestHandler {
  return (req: Request, res: Response) => {
    const preferences: CookiePreferences = {};

    if (options.categories?.analytics) {
      preferences.analytics = false;
      options.onReject?.("analytics");
    }

    if (options.categories?.preferences) {
      preferences.preferences = false;
      options.onReject?.("preferences");
    }

    setCookiePolicy(res, preferences);
    res.cookie(COOKIE_BANNER_SEEN, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    const returnUrl = req.body?.returnUrl || req.headers.referer || "/";
    res.redirect(returnUrl);
  };
}

export function createSavePreferencesHandler(options: CookieManagerOptions): RequestHandler {
  return (req: Request, res: Response) => {
    const preferences: CookiePreferences = {};

    if (options.categories?.analytics) {
      const analyticsEnabled = req.body?.analytics === "on" || req.body?.analytics === true;
      preferences.analytics = analyticsEnabled;

      if (analyticsEnabled) {
        options.onAccept?.("analytics");
      } else {
        options.onReject?.("analytics");
      }
    }

    if (options.categories?.preferences) {
      const preferencesEnabled = req.body?.preferences === "on" || req.body?.preferences === true;
      preferences.preferences = preferencesEnabled;

      if (preferencesEnabled) {
        options.onAccept?.("preferences");
      } else {
        options.onReject?.("preferences");
      }
    }

    setCookiePolicy(res, preferences);
    res.cookie(COOKIE_BANNER_SEEN, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.redirect(options.preferencesPath || "/cookies");
  };
}

export function configureCookieRoutes(app: Express, options: CookieManagerOptions): void {
  const config = mergeWithDefaults(options);

  app.post("/cookies/accept", createAcceptCookiesHandler(options));
  app.post("/cookies/reject", createRejectCookiesHandler(options));
  app.post("/cookies/save-preferences", createSavePreferencesHandler(options));

  app.get(config.preferencesPath, (req: Request, res: Response) => {
    const cookiePolicy = parseCookiePolicy(req.cookies?.[COOKIE_POLICY_NAME]);

    res.render("preferences", {
      cookiePreferences: cookiePolicy,
      categories: options.categories,
      saved: req.query.saved === "true",
    });
  });
}
