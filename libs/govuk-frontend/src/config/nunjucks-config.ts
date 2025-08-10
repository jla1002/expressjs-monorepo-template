import type { Environment } from "nunjucks";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function configureGovukNunjucks(env: Environment): void {
  // Add GOV.UK specific globals
  env.addGlobal("govukAssetPath", "/govuk/assets");
  env.addGlobal("assetPath", "/assets");
  env.addGlobal("javascriptPath", "/javascript");

  // Add common GOV.UK globals
  env.addGlobal("serviceName", process.env.SERVICE_NAME || "HMCTS Service");
  env.addGlobal("serviceUrl", process.env.SERVICE_URL || "/");
  env.addGlobal("feedbackUrl", process.env.FEEDBACK_URL || "https://www.gov.uk/contact");
  env.addGlobal("signOutUrl", process.env.SIGN_OUT_URL || "/auth/sign-out");
  env.addGlobal("phase", process.env.PHASE || "beta");

  // Add GOV.UK specific filters
  addGovukFilters(env);
}

function addGovukFilters(env: Environment): void {
  // Add a filter for generating GOV.UK compatible IDs
  env.addFilter("govukId", (value: string) => {
    if (!value) return "";
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  });

  // Add a filter for formatting dates in GOV.UK style
  env.addFilter("govukDate", (value: Date | string) => {
    if (!value) return "";
    const date = new Date(value);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  });

  // Add a filter for formatting times in GOV.UK style
  env.addFilter("govukTime", (value: Date | string) => {
    if (!value) return "";
    const date = new Date(value);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr}${ampm}`;
  });

  // Add a filter for handling error summaries
  env.addFilter("govukErrorSummary", (errors: Record<string, string>) => {
    if (!errors || Object.keys(errors).length === 0) return null;

    return Object.entries(errors).map(([field, message]) => ({
      text: message,
      href: `#${field}`,
    }));
  });
}
