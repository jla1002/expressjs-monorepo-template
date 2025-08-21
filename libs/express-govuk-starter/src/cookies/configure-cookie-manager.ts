import type { Express } from "express";
import type { CookieManagerOptions } from "./cookie-configuration.js";
import { configureCookieRoutes, createCookieManagerMiddleware } from "./cookie-manager-middleware.js";

export interface CookieTranslations {
  cookiePreferences: {
    title: { en: string; cy: string };
    intro: { en: string; cy: string };
    essentialTitle: { en: string; cy: string };
    essentialDescription: { en: string; cy: string };
    analyticsTitle: { en: string; cy: string };
    analyticsDescription: { en: string; cy: string };
    preferencesTitle: { en: string; cy: string };
    preferencesDescription: { en: string; cy: string };
    useAnalytics: { en: string; cy: string };
    doNotUseAnalytics: { en: string; cy: string };
    usePreferences: { en: string; cy: string };
    doNotUsePreferences: { en: string; cy: string };
    saveButton: { en: string; cy: string };
    successBanner: { en: string; cy: string };
    successMessage: { en: string; cy: string };
  };
}

const DEFAULT_COOKIE_TRANSLATIONS: CookieTranslations = {
  cookiePreferences: {
    title: {
      en: "Cookie preferences",
      cy: "Dewisiadau cwcis",
    },
    intro: {
      en: "We use cookies to make this service work and collect analytics information. To accept or reject cookies, choose an option below and save your preferences.",
      cy: "Rydym yn defnyddio cwcis i wneud i'r gwasanaeth hwn weithio a chasglu gwybodaeth dadansoddi. I dderbyn neu wrthod cwcis, dewiswch opsiwn isod a chadw eich dewisiadau.",
    },
    essentialTitle: {
      en: "Essential cookies",
      cy: "Cwcis hanfodol",
    },
    essentialDescription: {
      en: "These cookies are necessary for the service to function. They cannot be turned off.",
      cy: "Mae'r cwcis hyn yn angenrheidiol i'r gwasanaeth weithio. Ni allant gael eu diffodd.",
    },
    analyticsTitle: {
      en: "Analytics cookies",
      cy: "Cwcis dadansoddi",
    },
    analyticsDescription: {
      en: "These cookies help us understand how you use the service so we can make improvements.",
      cy: "Mae'r cwcis hyn yn ein helpu i ddeall sut rydych yn defnyddio'r gwasanaeth fel y gallwn wneud gwelliannau.",
    },
    preferencesTitle: {
      en: "Settings cookies",
      cy: "Cwcis gosodiadau",
    },
    preferencesDescription: {
      en: "These cookies remember your settings and preferences.",
      cy: "Mae'r cwcis hyn yn cofio eich gosodiadau a'ch dewisiadau.",
    },
    useAnalytics: {
      en: "Use analytics cookies",
      cy: "Defnyddio cwcis dadansoddi",
    },
    doNotUseAnalytics: {
      en: "Do not use analytics cookies",
      cy: "Peidio â defnyddio cwcis dadansoddi",
    },
    usePreferences: {
      en: "Use settings cookies",
      cy: "Defnyddio cwcis gosodiadau",
    },
    doNotUsePreferences: {
      en: "Do not use settings cookies",
      cy: "Peidio â defnyddio cwcis gosodiadau",
    },
    saveButton: {
      en: "Save cookie preferences",
      cy: "Cadw dewisiadau cwcis",
    },
    successBanner: {
      en: "Success",
      cy: "Llwyddiant",
    },
    successMessage: {
      en: "Your cookie settings have been saved",
      cy: "Mae eich gosodiadau cwcis wedi'u cadw",
    },
  },
};

export async function configureCookieManager(app: Express, options: CookieManagerOptions): Promise<void> {
  // Merge translations into res.locals.t
  app.use((req, res, next) => {
    if (!res.locals.t) {
      res.locals.t = {};
    }
    res.locals.t = {
      ...res.locals.t,
      ...DEFAULT_COOKIE_TRANSLATIONS,
    };

    // Set current URL for the cookie banner
    res.locals.currentUrl = req.originalUrl;

    next();
  });

  // Apply cookie manager middleware
  app.use(createCookieManagerMiddleware(options));

  // Configure cookie routes
  configureCookieRoutes(app, options);
}
