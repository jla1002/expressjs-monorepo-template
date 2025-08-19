import { describe, expect, it } from "vitest";
import { getTranslation } from "./translation-loader.js";

describe("getTranslation", () => {
  const translations = {
    en: {
      welcome: "Welcome",
      navigation: {
        home: "Home",
        about: "About",
        nested: {
          deep: "Deep value",
        },
      },
    },
    cy: {
      welcome: "Croeso",
      navigation: {
        home: "Hafan",
        about: "Amdanom",
        nested: {
          deep: "Gwerth ddofn",
        },
      },
    },
  };

  it("should get a simple translation key", () => {
    expect(getTranslation(translations, "welcome", "en")).toBe("Welcome");
    expect(getTranslation(translations, "welcome", "cy")).toBe("Croeso");
  });

  it("should get a nested translation key", () => {
    expect(getTranslation(translations, "navigation.home", "en")).toBe("Home");
    expect(getTranslation(translations, "navigation.home", "cy")).toBe("Hafan");
  });

  it("should get a deeply nested translation key", () => {
    expect(getTranslation(translations, "navigation.nested.deep", "en")).toBe("Deep value");
    expect(getTranslation(translations, "navigation.nested.deep", "cy")).toBe("Gwerth ddofn");
  });

  it("should return the key if translation not found", () => {
    expect(getTranslation(translations, "nonexistent", "en")).toBe("nonexistent");
    expect(getTranslation(translations, "navigation.missing", "en")).toBe("navigation.missing");
  });

  it("should fall back to English if Welsh translation missing", () => {
    const partialTranslations = {
      en: {
        onlyInEnglish: "English only",
      },
      cy: {},
    };
    // When the key doesn't exist in Welsh, it falls back to English
    expect(getTranslation(partialTranslations, "onlyInEnglish", "cy")).toBe("English only");
  });

  it("should handle missing locale by using fallback", () => {
    expect(getTranslation(translations, "welcome", "fr", "en")).toBe("Welcome");
  });

  it("should handle non-string values by returning the key", () => {
    const complexTranslations = {
      en: {
        navigation: {
          home: "Home",
        },
      },
    };
    expect(getTranslation(complexTranslations, "navigation", "en")).toBe("navigation");
  });
});
