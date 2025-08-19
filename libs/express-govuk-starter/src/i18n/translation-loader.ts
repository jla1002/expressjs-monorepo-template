import { existsSync } from "node:fs";
import { join } from "node:path";

export interface Translations {
  [locale: string]: any;
}

export async function loadTranslations(localesPath: string): Promise<Translations> {
  const translations: Translations = {};
  const supportedLocales = ["en", "cy"];

  for (const locale of supportedLocales) {
    const filePath = join(localesPath, `${locale}.json`);

    if (existsSync(filePath)) {
      try {
        const langContent = await import(filePath);
        translations[locale] = langContent.content;
      } catch (error) {
        console.error(`Failed to load translations for ${locale}:`, error);
      }
    } else {
      console.warn(`Translation file not found for ${locale}: ${filePath}`);
      translations[locale] = {};
    }
  }

  return translations;
}

export function getTranslation(translations: Translations, key: string, locale: string, fallbackLocale = "en"): string {
  const keys = key.split(".");
  let value = translations[locale];

  if (!value && locale !== fallbackLocale) {
    value = translations[fallbackLocale];
  }

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  if (typeof value === "string") {
    return value;
  }

  if (!translations[locale] && locale !== fallbackLocale) {
    return getTranslation(translations, key, fallbackLocale, fallbackLocale);
  }

  return key;
}
