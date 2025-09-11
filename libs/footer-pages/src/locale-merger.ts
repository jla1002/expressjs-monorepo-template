import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function mergeFooterLocales(appLocalesPath: string, footerLocalesPath: string): Promise<void> {
  const supportedLocales = ["en", "cy"];

  for (const locale of supportedLocales) {
    const footerPath = join(footerLocalesPath, `${locale}.js`);
    const appPath = join(appLocalesPath, `${locale}.js`);

    if (existsSync(footerPath) && existsSync(appPath)) {
      const footerModule = await import(pathToFileURL(footerPath).href);
      const appModule = await import(pathToFileURL(appPath).href);

      // Merge footer locale content into app locale content
      const footerContent = footerModule.content || footerModule.default || {};
      const appContent = appModule.content || appModule.default || {};

      // Deep merge the content
      Object.assign(appContent, {
        ...appContent,
        common: {
          ...appContent.common,
          ...footerContent.common
        },
        serviceConfig: {
          ...appContent.serviceConfig,
          ...footerContent.serviceConfig
        }
      });
    }
  }
}
