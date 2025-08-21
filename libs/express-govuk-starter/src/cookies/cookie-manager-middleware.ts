import type { Express, NextFunction, Request, RequestHandler, Response } from "express";

const COOKIE_POLICY_NAME = "cookie_policy";
const COOKIE_BANNER_SEEN = "cookie_banner_seen";

export async function configureCookieManager(app: Express, options: CookieManagerOptions): Promise<void> {
  app.use(createCookieManagerMiddleware(options));
  configureCookieRoutes(app, options);
}

function createCookieManagerMiddleware(options: CookieManagerOptions): RequestHandler {
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
    res.locals.cookieConfig = options;

    next();
  };
}

function parseCookiePolicy(cookiePolicyValue: string | undefined): CookiePreferences {
  if (!cookiePolicyValue) {
    return {};
  }

  try {
    return JSON.parse(decodeURIComponent(cookiePolicyValue));
  } catch {
    return {};
  }
}

function setCookiePolicy(res: Response, preferences: CookiePreferences): void {
  const value = encodeURIComponent(JSON.stringify(preferences));
  res.cookie(COOKIE_POLICY_NAME, value, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  });
}

function createAcceptCookiesHandler(options: CookieManagerOptions): RequestHandler {
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

function createRejectCookiesHandler(options: CookieManagerOptions): RequestHandler {
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

function createSavePreferencesHandler(options: CookieManagerOptions): RequestHandler {
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

function configureCookieRoutes(app: Express, config: CookieManagerOptions): void {
  app.post("/cookies/accept", createAcceptCookiesHandler(config));
  app.post("/cookies/reject", createRejectCookiesHandler(config));
  app.post("/cookies/save-preferences", createSavePreferencesHandler(config));

  app.get(config.preferencesPath || "/cookies", (req: Request, res: Response) => {
    const cookiePolicy = parseCookiePolicy(req.cookies?.[COOKIE_POLICY_NAME]);

    const en = {
      title: "Cookie preferences",
      intro: "We use cookies to make this service work and collect analytics information. To accept or reject cookies, choose an option below and save your preferences.",
      essentialTitle: "Essential cookies",
      essentialDescription: "These cookies are necessary for the service to function. They cannot be turned off.",
      analyticsTitle: "Analytics cookies",
      analyticsDescription: "These cookies help us understand how you use the service so we can make improvements.",
      preferencesTitle: "Settings cookies",
      preferencesDescription: "These cookies remember your settings and preferences.",
      useAnalytics: "Use analytics cookies",
      doNotUseAnalytics: "Do not use analytics cookies",
      usePreferences: "Use settings cookies",
      doNotUsePreferences: "Do not use settings cookies",
      saveButton: "Save cookie preferences",
      successBanner: "Success",
      successMessage: "Your cookie settings have been saved",
      cookiePreferences: cookiePolicy,
      categories: config.categories,
      saved: req.query.saved === "true",
    };

    const cy = {
      title: "Dewisiadau cwcis",
      intro: "Rydym yn defnyddio cwcis i wneud i'r gwasanaeth hwn weithio a chasglu gwybodaeth dadansoddi. I dderbyn neu wrthod cwcis, dewiswch opsiwn isod a chadw eich dewisiadau.",
      essentialTitle: "Cwcis hanfodol",
      essentialDescription: "Mae'r cwcis hyn yn angenrheidiol i'r gwasanaeth weithio. Ni allant gael eu diffodd.",
      analyticsTitle: "Cwcis dadansoddi",
      analyticsDescription: "Mae'r cwcis hyn yn ein helpu i ddeall sut rydych yn defnyddio'r gwasanaeth fel y gallwn wneud gwelliannau.",
      preferencesTitle: "Cwcis gosodiadau",
      preferencesDescription: "Mae'r cwcis hyn yn cofio eich gosodiadau a'ch dewisiadau.",
      useAnalytics: "Defnyddio cwcis dadansoddi",
      doNotUseAnalytics: "Peidio â defnyddio cwcis dadansoddi",
      usePreferences: "Defnyddio cwcis gosodiadau",
      doNotUsePreferences: "Peidio â defnyddio cwcis gosodiadau",
      saveButton: "Cadw dewisiadau cwcis",
      successBanner: "Llwyddiant",
      successMessage: "Mae eich gosodiadau cwcis wedi'u cadw",
      cookiePreferences: cookiePolicy,
      categories: config.categories,
      saved: req.query.saved === "true",
    };

    res.render("cookie-preferences", { en, cy });
  });
}

export interface CookieManagerOptions {
  essential?: string[];
  categories?: {
    analytics?: string[];
    preferences?: string[];
    [key: string]: string[] | undefined;
  };
  onAccept?: (category: string) => void;
  onReject?: (category: string) => void;
  preferencesPath?: string;
}

export interface CookiePreferences {
  analytics?: boolean;
  preferences?: boolean;
  [key: string]: boolean | undefined;
}

export interface CookieManagerState {
  cookiesAccepted?: boolean;
  cookiePreferences?: CookiePreferences;
  showBanner?: boolean;
}
