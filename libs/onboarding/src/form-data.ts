// Core data types for onboarding form

// Complete form data structure
export interface OnboardingFormData {
  name: {
    firstName: string;
    lastName: string;
  };
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  address: {
    address1: string;
    address2?: string;
    townCity: string;
    county?: string;
    postcode: string;
  };
  role: {
    role: 'frontend' | 'backend' | 'testEngineer' | 'other';
    otherRole?: string;
  };
}

// Session data structure
export interface OnboardingSession {
  formData: Partial<OnboardingFormData>;
  currentStep: string;
  completedSteps: string[];
  startedAt: Date;
  lastActivity: Date;
  referenceNumber?: string;
}

// Express session type extension
declare module 'express-session' {
  interface SessionData {
    onboarding?: OnboardingSession;
  }
}

// Request validation types
export interface NameFormRequest {
  firstName: string;
  lastName: string;
}

export interface DateOfBirthFormRequest {
  day: string;
  month: string;
  year: string;
}

export interface AddressFormRequest {
  address1: string;
  address2?: string;
  townCity: string;
  county?: string;
  postcode: string;
}

export interface RoleFormRequest {
  role: string;
  otherRole?: string;
}

// Template data types
export interface PageTemplateData {
  en: Record<string, any>;
  cy: Record<string, any>;
  errors?: Record<string, { text: string; href: string }>;
  errorSummary?: Array<{ text: string; href: string }>;
  formData?: any;
  hasErrors?: boolean;
}

// Validation result interface
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, { text: string; href: string }>;
  errorSummary?: Array<{ text: string; href: string }>;
}