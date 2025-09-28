import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Schema discovery functionality for module integration
import { prismaSchemas as onboardingSchemas } from "@hmcts/onboarding";

export function getPrismaSchemas(): string[] {
  return [onboardingSchemas];
}
