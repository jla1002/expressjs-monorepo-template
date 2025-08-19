import type { NextFunction, Request, Response } from "express";
import type { Translations } from "./translation-loader.js";

declare module "express-session" {
  interface SessionData {
    locale?: string;
  }
}

export interface LocaleMiddlewareOptions {
  supportedLocales?: string[];
  defaultLocale?: string;
  queryParam?: string;
  cookieName?: string;
}

export function localeMiddleware(options: LocaleMiddlewareOptions = {}) {
  const { supportedLocales = ["en", "cy"], defaultLocale = "en", queryParam = "lng", cookieName = "locale" } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    let locale = defaultLocale;

    if (req.query[queryParam] && typeof req.query[queryParam] === "string") {
      const queryLocale = req.query[queryParam];
      if (supportedLocales.includes(queryLocale)) {
        locale = queryLocale;
      }
    } else if (req.session?.locale && supportedLocales.includes(req.session.locale)) {
      locale = req.session.locale;
    } else if (req.cookies?.[cookieName] && supportedLocales.includes(req.cookies[cookieName])) {
      locale = req.cookies[cookieName];
    }

    if (req.session) {
      req.session.locale = locale;
    }

    if (req.cookies) {
      res.cookie(cookieName, locale, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    res.locals.locale = locale;
    res.locals.otherLocale = locale === "en" ? "cy" : "en";

    next();
  };
}

export function translationMiddleware(translations: Translations) {
  return (req: Request, res: Response, next: NextFunction) => {
    const locale = res.locals.locale || "en";
    const otherLocale = locale === "en" ? "cy" : "en";

    const currentTranslations = translations[locale] || translations.en || {};

    Object.assign(res.locals, currentTranslations);

    res.locals.languageToggle = {
      link: `?lng=${otherLocale}`,
      text: currentTranslations.language?.switch || otherLocale.toUpperCase(),
    };

    next();
  };
}
