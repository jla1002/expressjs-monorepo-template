import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { deepMerge } from "./utils.js";
import fs from "node:fs";
import { addFromAzureVault } from "./azure-vault.js";

export interface AddToOptions {
  mountPoint?: string;
  failOnError?: boolean;
  chartPath?: string;
}

export interface Config {
  [key: string]: any;
}

const DEFAULT_MOUNT_POINT = "/mnt/secrets";

/**
 * Adds properties from mounted volume to configuration object
 * Matches the API of @hmcts/properties-volume addTo function
 */
export async function configurePropertiesVolume(config: Config, options: AddToOptions = {}): Promise<void> {
  const { mountPoint = DEFAULT_MOUNT_POINT, failOnError = true, chartPath } = options;

  if (chartPath && process.env.NODE_ENV !== "production" && fs.existsSync(chartPath)) {
    return await addFromAzureVault(config, { pathToHelmChart: chartPath });
  }

  try {
    if (!existsSync(mountPoint)) {
      const message = `Mount point ${mountPoint} does not exist`;
      if (failOnError) {
        throw new Error(message);
      }
      console.warn(`Properties volume: ${message}`);
      return;
    }

    const files = readdirSync(mountPoint);
    const properties: Config = {};

    for (const file of files) {
      const filePath = join(mountPoint, file);

      try {
        const content = readFileSync(filePath, "utf8").trim();

        // Use filename as property key, content as value
        properties[file] = content;
      } catch (error) {
        const message = `Failed to read property file ${filePath}: ${error}`;
        if (failOnError) {
          throw new Error(message);
        }
        console.warn(`Properties volume: ${message}`);
      }
    }

    // Merge properties into the configuration object
    Object.assign(config, deepMerge(config, properties));
  } catch (error) {
    const message = `Failed to load properties from ${mountPoint}: ${error}`;
    if (failOnError) {
      throw new Error(message);
    }
    console.warn(`Properties volume: ${message}`);
  }
}
