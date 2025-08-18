import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { deepMerge } from "./utils.js";

export interface AddToOptions {
  mountPoint?: string;
  failOnError?: boolean;
}

export interface Config {
  [key: string]: any;
}

const DEFAULT_MOUNT_POINT = "/mnt/secrets";

/**
 * Adds properties from mounted volume to configuration object
 * Matches the API of @hmcts/properties-volume addTo function
 */
export function addTo(config: Config, options: AddToOptions = {}): void {
  const { mountPoint = DEFAULT_MOUNT_POINT, failOnError = true } = options;

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
