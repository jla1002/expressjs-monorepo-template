export * from './middleware/locale-middleware.js';
export * from './services/translation-service.js';

// Placeholder exports for future expansion
export interface I18nConfig {
  defaultLocale?: string;
  supportedLocales?: string[];
  fallbackLocale?: string;
  loadPath?: string;
  cookie?: {
    name?: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
  };
}

/**
 * Placeholder function for i18n initialization
 * This will be expanded to set up the full i18n system
 * 
 * @param config - i18n configuration options
 */
export function initializeI18n(config?: I18nConfig): void {
  // TODO: Implement initialization logic
  console.log('i18n module initialized with config:', config);
}

/**
 * Get the list of supported locales
 * Default: English (en) and Welsh (cy)
 */
export function getSupportedLocales(): string[] {
  return (process.env.SUPPORTED_LOCALES || 'en,cy').split(',');
}

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): boolean {
  return getSupportedLocales().includes(locale);
}