import type { Request, Response, NextFunction } from "express";

export interface LocaleRequest extends Request {
  locale?: string;
  t?: (key: string, options?: any) => string;
}

/**
 * Placeholder middleware for locale detection and setup
 * This will be expanded to include full i18n functionality
 *
 * Priority order for locale detection:
 * 1. Query parameter (?lng=cy)
 * 2. Cookie (locale=cy)
 * 3. Session value
 * 4. Accept-Language header
 * 5. Default locale (en)
 */
export function localeMiddleware() {
  return (req: LocaleRequest, res: Response, next: NextFunction) => {
    // TODO: Implement proper locale detection
    const locale =
      (req.query.lng as string) ||
      req.cookies?.locale ||
      (req.session as any)?.locale ||
      req.headers["accept-language"]?.split(",")[0]?.split("-")[0] ||
      process.env.DEFAULT_LOCALE ||
      "en";

    // Validate locale is supported
    const supportedLocales = (process.env.SUPPORTED_LOCALES || "en,cy").split(",");
    req.locale = supportedLocales.includes(locale) ? locale : "en";

    // Set locale in response locals for templates
    res.locals.locale = req.locale;
    res.locals.currentLanguage = req.locale;

    // TODO: Implement translation function
    // Placeholder translation function
    req.t = (key: string, options?: any) => {
      // This would normally look up translations from loaded files
      return key;
    };

    res.locals.t = req.t;

    // Set locale cookie for persistence
    if (req.locale !== req.cookies?.locale) {
      res.cookie("locale", req.locale, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    next();
  };
}
