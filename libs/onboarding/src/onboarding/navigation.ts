// Navigation helper functions for onboarding flow
import { ONBOARDING_ROUTES } from "./routes.js";

const PAGE_ORDER = ["start", "name", "date-of-birth", "address", "role", "summary", "confirmation"];

export function getPreviousPage(currentPage: string): string | null {
  const currentIndex = PAGE_ORDER.indexOf(currentPage);
  if (currentIndex <= 0) return null;

  const previousPage = PAGE_ORDER[currentIndex - 1];
  const routeMap: Record<string, string> = {
    start: ONBOARDING_ROUTES.START,
    name: ONBOARDING_ROUTES.NAME,
    "date-of-birth": ONBOARDING_ROUTES.DATE_OF_BIRTH,
    address: ONBOARDING_ROUTES.ADDRESS,
    role: ONBOARDING_ROUTES.ROLE,
    summary: ONBOARDING_ROUTES.SUMMARY,
    confirmation: ONBOARDING_ROUTES.CONFIRMATION
  };
  return routeMap[previousPage] || null;
}

export function getNextPage(currentPage: string): string {
  const currentIndex = PAGE_ORDER.indexOf(currentPage);
  const nextPage = PAGE_ORDER[currentIndex + 1];

  const routeMap: Record<string, string> = {
    start: ONBOARDING_ROUTES.START,
    name: ONBOARDING_ROUTES.NAME,
    "date-of-birth": ONBOARDING_ROUTES.DATE_OF_BIRTH,
    address: ONBOARDING_ROUTES.ADDRESS,
    role: ONBOARDING_ROUTES.ROLE,
    summary: ONBOARDING_ROUTES.SUMMARY,
    confirmation: ONBOARDING_ROUTES.CONFIRMATION
  };
  return routeMap[nextPage] || ONBOARDING_ROUTES.SUMMARY;
}

// Get page route for change links on summary page
export function getChangePageRoute(field: string): string {
  const pageMap: Record<string, string> = {
    name: ONBOARDING_ROUTES.NAME,
    dateOfBirth: ONBOARDING_ROUTES.DATE_OF_BIRTH,
    address: ONBOARDING_ROUTES.ADDRESS,
    role: ONBOARDING_ROUTES.ROLE
  };
  return pageMap[field] || ONBOARDING_ROUTES.START;
}

// Check if current page has a back link
export function hasBackLink(currentPage: string): boolean {
  return currentPage !== "start" && currentPage !== "confirmation";
}

// Format date for display
export function formatDateForDisplay(dateData: { day: number; month: number; year: number }): string {
  return `${dateData.day} ${getMonthName(dateData.month)} ${dateData.year}`;
}

// Get month name for date display
export function getMonthName(month: number): string {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[month - 1] || "";
}

// Format address for display
export function formatAddressForDisplay(address: { addressLine1: string; addressLine2?: string; town: string; postcode: string }): string[] {
  const lines = [address.addressLine1];
  if (address.addressLine2) {
    lines.push(address.addressLine2);
  }
  lines.push(address.town);
  lines.push(address.postcode);
  return lines;
}

// Format role for display
export function formatRoleForDisplay(role: { roleType: string; roleOther?: string }): string {
  const roleMap: Record<string, string> = {
    "frontend-developer": "Frontend Developer",
    "backend-developer": "Backend Developer",
    "test-engineer": "Test Engineer",
    other: role.roleOther || "Other"
  };
  return roleMap[role.roleType] || role.roleType;
}
