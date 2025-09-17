import type { Request } from "express";
import type { OnboardingSession, OnboardingFormData } from "../form-data.js";

const FLOW_SEQUENCE = ['name', 'date-of-birth', 'address', 'role', 'summary'];

export class SessionService {
  /**
   * Initialize or get the onboarding session
   */
  static initializeSession(req: Request): OnboardingSession {
    if (!req.session.onboarding) {
      req.session.onboarding = {
        formData: {},
        currentStep: 'name',
        completedSteps: [],
        startedAt: new Date(),
        lastActivity: new Date()
      };
    }
    return req.session.onboarding;
  }

  /**
   * Update session with step data
   */
  static updateSession(req: Request, stepName: string, data: any): void {
    const session = SessionService.initializeSession(req);

    session.formData[stepName as keyof OnboardingFormData] = data;
    session.currentStep = stepName;
    session.lastActivity = new Date();

    if (!session.completedSteps.includes(stepName)) {
      session.completedSteps.push(stepName);
    }

    req.session.onboarding = session;
  }

  /**
   * Get form data for a specific step
   */
  static getStepData<T>(req: Request, stepName: keyof OnboardingFormData): T | undefined {
    const session = req.session.onboarding;
    if (!session) return undefined;

    return session.formData[stepName] as T;
  }

  /**
   * Get all form data
   */
  static getAllFormData(req: Request): Partial<OnboardingFormData> {
    const session = req.session.onboarding;
    return session?.formData || {};
  }

  /**
   * Check if a step has been completed
   */
  static isStepCompleted(req: Request, stepName: string): boolean {
    const session = req.session.onboarding;
    return session?.completedSteps.includes(stepName) || false;
  }

  /**
   * Validate flow progression - ensures users can't skip steps
   */
  static validateFlowProgression(req: Request, requestedStep: string): boolean {
    const session = req.session.onboarding;
    if (!session) return requestedStep === 'name';

    const currentIndex = FLOW_SEQUENCE.indexOf(session.currentStep);
    const requestedIndex = FLOW_SEQUENCE.indexOf(requestedStep);

    // Allow backward navigation and summary from any completed step
    if (requestedStep === 'summary' || requestedIndex <= currentIndex) {
      return true;
    }

    // Ensure all previous steps are completed
    return SessionService.hasCompletedPreviousSteps(req, requestedIndex);
  }

  /**
   * Check if all previous steps are completed
   */
  static hasCompletedPreviousSteps(req: Request, stepIndex: number): boolean {
    const session = req.session.onboarding;
    if (!session) return false;

    for (let i = 0; i < stepIndex; i++) {
      if (!session.completedSteps.includes(FLOW_SEQUENCE[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if the entire form is complete
   */
  static isFormComplete(req: Request): boolean {
    const formData = SessionService.getAllFormData(req);
    return !!(
      formData.name &&
      formData.dateOfBirth &&
      formData.address &&
      formData.role
    );
  }

  /**
   * Get the previous step in the flow
   */
  static getPreviousStep(currentStep: string): string | null {
    const currentIndex = FLOW_SEQUENCE.indexOf(currentStep);
    return currentIndex > 0 ? FLOW_SEQUENCE[currentIndex - 1] : null;
  }

  /**
   * Get the next step in the flow
   */
  static getNextStep(currentStep: string): string | null {
    const currentIndex = FLOW_SEQUENCE.indexOf(currentStep);
    if (currentIndex === -1) return null; // Invalid step
    return currentIndex < FLOW_SEQUENCE.length - 1 ? FLOW_SEQUENCE[currentIndex + 1] : null;
  }

  /**
   * Clear the session data
   */
  static clearSession(req: Request): void {
    if (req.session.onboarding) {
      delete req.session.onboarding;
    }
  }

  /**
   * Generate a unique reference number based on timestamp and random element
   * Format: NNNN-NNNN-NNNN-NNNN
   */
  static generateReferenceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const combined = timestamp.toString() + random.toString().padStart(4, '0');
    const padded = combined.padStart(20, '0').slice(-16); // Take last 16 digits
    const chunks = padded.match(/.{1,4}/g) || [];
    return chunks.join('-');
  }

  /**
   * Store reference number in session
   */
  static setReferenceNumber(req: Request, referenceNumber: string): void {
    const session = SessionService.initializeSession(req);
    session.referenceNumber = referenceNumber;
    req.session.onboarding = session;
  }

  /**
   * Get reference number from session
   */
  static getReferenceNumber(req: Request): string | undefined {
    return req.session.onboarding?.referenceNumber;
  }

  /**
   * Format date for display (e.g., "27 March 1985")
   */
  static formatDateForDisplay(dateData: { day: string; month: string; year: string }): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const day = parseInt(dateData.day);
    const month = parseInt(dateData.month) - 1;
    const year = parseInt(dateData.year);

    return `${day} ${months[month]} ${year}`;
  }

  /**
   * Format address for display as array of lines
   */
  static formatAddressForDisplay(addressData: {
    address1: string;
    address2?: string;
    townCity: string;
    county?: string;
    postcode: string;
  }): string[] {
    const lines = [addressData.address1];

    if (addressData.address2) {
      lines.push(addressData.address2);
    }

    lines.push(addressData.townCity);

    if (addressData.county) {
      lines.push(addressData.county);
    }

    lines.push(addressData.postcode);

    return lines;
  }
}