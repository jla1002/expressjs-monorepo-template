import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export interface Translations {
  [locale: string]: any;
}

export async function loadTranslations(localesPath: string): Promise<Translations> {
  const translations: Translations = {};
  const supportedLocales = ["en", "cy"];

  for (const locale of supportedLocales) {
    const tsFilePath = join(localesPath, `${locale}.ts`);
    const jsFilePath = join(localesPath, `${locale}.js`);

    // Check for .ts or .js file (compiled version)
    const filePath = existsSync(jsFilePath) ? jsFilePath : tsFilePath;

    if (existsSync(filePath)) {
      try {
        // Use file URL for dynamic import to work with absolute paths
        const fileUrl = pathToFileURL(filePath).href;
        const langContent = await import(fileUrl);
        translations[locale] = langContent.content || langContent.default || {};
      } catch (error) {
        console.error(`Failed to load translations for ${locale}:`, error);
        translations[locale] = {};
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

  // Try to get the value from the requested locale
  let value = translations[locale];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // If we can't find it in the requested locale and it's not the fallback, try the fallback
      if (locale !== fallbackLocale && translations[fallbackLocale]) {
        return getTranslation(translations, key, fallbackLocale, fallbackLocale);
      }
      return key;
    }
  }

  if (typeof value === "string") {
    return value;
  }

  return key;
}
