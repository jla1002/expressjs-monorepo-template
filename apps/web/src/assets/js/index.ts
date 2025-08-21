import cookieManager from "@hmcts/cookie-manager";
import { initAll } from "govuk-frontend";
import "../css/index.scss"; // used for dev mode HMR

initAll();

// Initialize HMCTS cookie manager
const config = {
  userPreferences: {
    cookieName: "cookie_policy",
  },
  cookieBanner: {
    class: "govuk-cookie-banner",
    actions: [
      {
        name: "accept",
        buttonClass: "js-cookie-banner-accept",
        confirmationClass: "cookie-banner-accept-message",
        consent: true,
      },
      {
        name: "reject",
        buttonClass: "js-cookie-banner-reject",
        confirmationClass: "cookie-banner-reject-message",
        consent: false,
      },
      {
        name: "hide",
        buttonClass: "js-cookie-banner-hide",
      },
    ],
  },
  preferencesForm: {
    class: "cookie-preferences-form",
  },
  cookieManifest: [
    {
      categoryName: "essential",
      optional: false,
      matchBy: "exact",
      cookies: ["session", "csrf_token", "cookie_policy", "cookies_preferences_set"],
    },
    {
      categoryName: "analytics",
      optional: true,
      cookies: ["_ga", "_gid", "dtCookie", "dtSa", "rxVisitor", "rxvt"],
    },
    {
      categoryName: "preferences",
      optional: true,
      cookies: ["language", "theme"],
    },
  ],
};

cookieManager.on("CookieBannerAction", (eventData: any) => {
  const action = typeof eventData === "string" ? eventData : eventData.action;

  if (action === "accept" || action === "reject") {
    requestAnimationFrame(() => {
      const banner = document.querySelector(".govuk-cookie-banner");
      if (banner) {
        (banner as HTMLElement).style.display = "none";
      }
    });
  }
});

// Initialize the cookie manager
cookieManager.init(config);
