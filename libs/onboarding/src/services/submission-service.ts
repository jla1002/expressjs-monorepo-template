import { prisma } from '@hmcts/postgres';
import type { OnboardingFormData } from '../form-data.js';

export class SubmissionService {
  /**
   * Save completed onboarding form to database
   */
  static async saveSubmission(formData: OnboardingFormData, referenceNumber: string): Promise<void> {
    // Convert date strings to Date object
    const dateOfBirth = new Date(
      parseInt(formData.dateOfBirth.year),
      parseInt(formData.dateOfBirth.month) - 1, // Month is 0-indexed in JavaScript
      parseInt(formData.dateOfBirth.day)
    );

    await prisma.onboardingSubmission.create({
      data: {
        referenceNumber,
        firstName: formData.name.firstName,
        lastName: formData.name.lastName,
        dateOfBirth,
        address1: formData.address.address1,
        address2: formData.address.address2 || null,
        townCity: formData.address.townCity,
        county: formData.address.county || null,
        postcode: formData.address.postcode,
        role: formData.role.role,
        otherRole: formData.role.otherRole || null
      }
    });
  }

  /**
   * Find submission by reference number
   */
  static async findByReferenceNumber(referenceNumber: string) {
    return prisma.onboardingSubmission.findUnique({
      where: {
        referenceNumber
      }
    });
  }

  /**
   * Get all submissions (for admin purposes)
   */
  static async getAllSubmissions() {
    return prisma.onboardingSubmission.findMany({
      orderBy: {
        submittedAt: 'desc'
      }
    });
  }

  /**
   * Count total submissions
   */
  static async getSubmissionCount(): Promise<number> {
    return prisma.onboardingSubmission.count();
  }
}