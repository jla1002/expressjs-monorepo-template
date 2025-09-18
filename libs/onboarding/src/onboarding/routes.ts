// Route constants for the onboarding module
export const ONBOARDING_ROUTES = {
  START: "/onboarding/start",
  NAME: "/onboarding/name",
  DATE_OF_BIRTH: "/onboarding/date-of-birth",
  ADDRESS: "/onboarding/address",
  ROLE: "/onboarding/role",
  SUMMARY: "/onboarding/summary",
  CONFIRMATION: "/onboarding/confirmation"
} as const;

export type OnboardingRoute = (typeof ONBOARDING_ROUTES)[keyof typeof ONBOARDING_ROUTES];
