export interface CookieCategory {
  cookies: string[];
  description?: string;
  defaultEnabled?: boolean;
}

export interface CookieManagerOptions {
  essential?: string[];

  categories?: {
    analytics?: CookieCategory;
    preferences?: CookieCategory;
    [key: string]: CookieCategory | undefined;
  };

  onAccept?: (category: string) => void;
  onReject?: (category: string) => void;

  preferencesPath?: string;
  privacyPath?: string;

  cookieBannerContent?: {
    en?: {
      title?: string;
      message?: string;
      acceptButton?: string;
      rejectButton?: string;
      viewCookiesLink?: string;
    };
    cy?: {
      title?: string;
      message?: string;
      acceptButton?: string;
      rejectButton?: string;
      viewCookiesLink?: string;
    };
  };
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

const DEFAULT_COOKIE_BANNER_CONTENT = {
  en: {
    title: "Cookies on this service",
    message:
      "We use some essential cookies to make this service work. We'd also like to use analytics cookies so we can understand how you use the service and make improvements.",
    acceptButton: "Accept analytics cookies",
    rejectButton: "Reject analytics cookies",
    viewCookiesLink: "View cookies",
  },
  cy: {
    title: "Cwcis ar y gwasanaeth hwn",
    message:
      "Rydym yn defnyddio rhai cwcis hanfodol i wneud i'r gwasanaeth hwn weithio. Hoffem hefyd ddefnyddio cwcis dadansoddi fel y gallwn ddeall sut rydych yn defnyddio'r gwasanaeth a gwneud gwelliannau.",
    acceptButton: "Derbyn cwcis dadansoddi",
    rejectButton: "Gwrthod cwcis dadansoddi",
    viewCookiesLink: "Gweld cwcis",
  },
};

export function mergeWithDefaults(
  options: CookieManagerOptions,
): Required<Pick<CookieManagerOptions, "preferencesPath" | "privacyPath" | "cookieBannerContent">> & CookieManagerOptions {
  return {
    ...options,
    preferencesPath: options.preferencesPath ?? "/cookies",
    privacyPath: options.privacyPath ?? "/privacy",
    cookieBannerContent: {
      en: {
        ...DEFAULT_COOKIE_BANNER_CONTENT.en,
        ...options.cookieBannerContent?.en,
      },
      cy: {
        ...DEFAULT_COOKIE_BANNER_CONTENT.cy,
        ...options.cookieBannerContent?.cy,
      },
    },
  };
}
