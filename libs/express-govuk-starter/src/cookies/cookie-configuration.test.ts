import { describe, expect, it } from "vitest";
import { mergeWithDefaults } from "./cookie-configuration.js";

describe("Cookie Configuration", () => {
  describe("mergeWithDefaults", () => {
    it("should provide default paths when not specified", () => {
      const result = mergeWithDefaults({});

      expect(result.preferencesPath).toBe("/cookies");
      expect(result.privacyPath).toBe("/privacy");
    });

    it("should use custom paths when provided", () => {
      const result = mergeWithDefaults({
        preferencesPath: "/custom-cookies",
        privacyPath: "/custom-privacy",
      });

      expect(result.preferencesPath).toBe("/custom-cookies");
      expect(result.privacyPath).toBe("/custom-privacy");
    });

    it("should provide default cookie banner content", () => {
      const result = mergeWithDefaults({});

      expect(result.cookieBannerContent.en.title).toBe("Cookies on this service");
      expect(result.cookieBannerContent.cy.title).toBe("Cwcis ar y gwasanaeth hwn");
      expect(result.cookieBannerContent.en.acceptButton).toBe("Accept analytics cookies");
      expect(result.cookieBannerContent.cy.acceptButton).toBe("Derbyn cwcis dadansoddi");
    });

    it("should merge custom banner content with defaults", () => {
      const result = mergeWithDefaults({
        cookieBannerContent: {
          en: {
            title: "Custom title",
          },
        },
      });

      expect(result.cookieBannerContent.en.title).toBe("Custom title");
      expect(result.cookieBannerContent.en.message).toContain("We use some essential cookies");
      expect(result.cookieBannerContent.cy.title).toBe("Cwcis ar y gwasanaeth hwn");
    });

    it("should preserve other options", () => {
      const onAccept = () => {};
      const result = mergeWithDefaults({
        essential: ["session"],
        categories: {
          analytics: {
            cookies: ["_ga"],
            defaultEnabled: false,
          },
        },
        onAccept,
      });

      expect(result.essential).toEqual(["session"]);
      expect(result.categories?.analytics?.cookies).toEqual(["_ga"]);
      expect(result.onAccept).toBe(onAccept);
    });
  });
});
