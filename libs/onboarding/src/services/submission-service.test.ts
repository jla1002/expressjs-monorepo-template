import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubmissionService } from './submission-service.js';
import type { OnboardingFormData } from '../form-data.js';

// Mock Prisma
vi.mock('@hmcts/postgres', () => ({
  prisma: {
    onboardingSubmission: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn()
    }
  }
}));

// Import the mocked prisma after the mock
import { prisma } from '@hmcts/postgres';
const mockPrisma = vi.mocked(prisma);

describe('SubmissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFormData: OnboardingFormData = {
    name: {
      firstName: 'John',
      lastName: 'Doe'
    },
    dateOfBirth: {
      day: '15',
      month: '6',
      year: '1990'
    },
    address: {
      address1: '123 Test Street',
      address2: 'Apartment 4B',
      townCity: 'London',
      county: 'Greater London',
      postcode: 'SW1A 1AA'
    },
    role: {
      role: 'frontend'
    }
  };

  describe('saveSubmission', () => {
    it('should save submission with all fields to database', async () => {
      const referenceNumber = '1234-5678-9012-3456';

      await SubmissionService.saveSubmission(mockFormData, referenceNumber);

      expect(mockPrisma.onboardingSubmission.create).toHaveBeenCalledWith({
        data: {
          referenceNumber,
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date(1990, 5, 15), // Month is 0-indexed
          address1: '123 Test Street',
          address2: 'Apartment 4B',
          townCity: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
          role: 'frontend',
          otherRole: null
        }
      });
    });

    it('should save submission with minimal fields (no optional fields)', async () => {
      const minimalFormData: OnboardingFormData = {
        name: {
          firstName: 'Jane',
          lastName: 'Smith'
        },
        dateOfBirth: {
          day: '1',
          month: '1',
          year: '1985'
        },
        address: {
          address1: '456 Main Road',
          townCity: 'Birmingham',
          postcode: 'B1 1AA'
        },
        role: {
          role: 'backend'
        }
      };
      const referenceNumber = '9876-5432-1098-7654';

      await SubmissionService.saveSubmission(minimalFormData, referenceNumber);

      expect(mockPrisma.onboardingSubmission.create).toHaveBeenCalledWith({
        data: {
          referenceNumber,
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: new Date(1985, 0, 1), // Month is 0-indexed
          address1: '456 Main Road',
          address2: null,
          townCity: 'Birmingham',
          county: null,
          postcode: 'B1 1AA',
          role: 'backend',
          otherRole: null
        }
      });
    });

    it('should save submission with other role specified', async () => {
      const formDataWithOtherRole: OnboardingFormData = {
        ...mockFormData,
        role: {
          role: 'other',
          otherRole: 'DevOps Engineer'
        }
      };
      const referenceNumber = '1111-2222-3333-4444';

      await SubmissionService.saveSubmission(formDataWithOtherRole, referenceNumber);

      expect(mockPrisma.onboardingSubmission.create).toHaveBeenCalledWith({
        data: {
          referenceNumber,
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date(1990, 5, 15),
          address1: '123 Test Street',
          address2: 'Apartment 4B',
          townCity: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
          role: 'other',
          otherRole: 'DevOps Engineer'
        }
      });
    });

    it('should handle date conversion correctly for different dates', async () => {
      const testCases = [
        { day: '1', month: '1', year: '2000', expected: new Date(2000, 0, 1) },
        { day: '31', month: '12', year: '1999', expected: new Date(1999, 11, 31) },
        { day: '29', month: '2', year: '2000', expected: new Date(2000, 1, 29) }, // Leap year
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();
        const formData = {
          ...mockFormData,
          dateOfBirth: testCase
        };
        const referenceNumber = '1234-5678-9012-3456';

        await SubmissionService.saveSubmission(formData, referenceNumber);

        expect(mockPrisma.onboardingSubmission.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              dateOfBirth: testCase.expected
            })
          })
        );
      }
    });

    it('should propagate database errors', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.onboardingSubmission.create.mockRejectedValue(error);

      await expect(SubmissionService.saveSubmission(mockFormData, '1234-5678-9012-3456'))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('findByReferenceNumber', () => {
    it('should find submission by reference number', async () => {
      const referenceNumber = '1234-5678-9012-3456';
      const mockSubmission = {
        id: 'submission-id',
        referenceNumber,
        firstName: 'John',
        lastName: 'Doe',
        submittedAt: new Date()
      };

      mockPrisma.onboardingSubmission.findUnique.mockResolvedValue(mockSubmission);

      const result = await SubmissionService.findByReferenceNumber(referenceNumber);

      expect(mockPrisma.onboardingSubmission.findUnique).toHaveBeenCalledWith({
        where: {
          referenceNumber
        }
      });
      expect(result).toEqual(mockSubmission);
    });

    it('should return null when submission not found', async () => {
      const referenceNumber = 'non-existent-ref';

      mockPrisma.onboardingSubmission.findUnique.mockResolvedValue(null);

      const result = await SubmissionService.findByReferenceNumber(referenceNumber);

      expect(mockPrisma.onboardingSubmission.findUnique).toHaveBeenCalledWith({
        where: {
          referenceNumber
        }
      });
      expect(result).toBeNull();
    });

    it('should propagate database errors', async () => {
      const error = new Error('Database query failed');
      mockPrisma.onboardingSubmission.findUnique.mockRejectedValue(error);

      await expect(SubmissionService.findByReferenceNumber('1234-5678-9012-3456'))
        .rejects.toThrow('Database query failed');
    });
  });

  describe('getAllSubmissions', () => {
    it('should return all submissions ordered by submitted date desc', async () => {
      const mockSubmissions = [
        {
          id: 'submission-1',
          referenceNumber: '1111-2222-3333-4444',
          firstName: 'John',
          submittedAt: new Date('2023-06-15')
        },
        {
          id: 'submission-2',
          referenceNumber: '5555-6666-7777-8888',
          firstName: 'Jane',
          submittedAt: new Date('2023-06-14')
        }
      ];

      mockPrisma.onboardingSubmission.findMany.mockResolvedValue(mockSubmissions);

      const result = await SubmissionService.getAllSubmissions();

      expect(mockPrisma.onboardingSubmission.findMany).toHaveBeenCalledWith({
        orderBy: {
          submittedAt: 'desc'
        }
      });
      expect(result).toEqual(mockSubmissions);
    });

    it('should return empty array when no submissions exist', async () => {
      mockPrisma.onboardingSubmission.findMany.mockResolvedValue([]);

      const result = await SubmissionService.getAllSubmissions();

      expect(result).toEqual([]);
    });

    it('should propagate database errors', async () => {
      const error = new Error('Database query failed');
      mockPrisma.onboardingSubmission.findMany.mockRejectedValue(error);

      await expect(SubmissionService.getAllSubmissions())
        .rejects.toThrow('Database query failed');
    });
  });

  describe('getSubmissionCount', () => {
    it('should return count of submissions', async () => {
      const expectedCount = 42;
      mockPrisma.onboardingSubmission.count.mockResolvedValue(expectedCount);

      const result = await SubmissionService.getSubmissionCount();

      expect(mockPrisma.onboardingSubmission.count).toHaveBeenCalledWith();
      expect(result).toBe(expectedCount);
    });

    it('should return 0 when no submissions exist', async () => {
      mockPrisma.onboardingSubmission.count.mockResolvedValue(0);

      const result = await SubmissionService.getSubmissionCount();

      expect(result).toBe(0);
    });

    it('should propagate database errors', async () => {
      const error = new Error('Database count failed');
      mockPrisma.onboardingSubmission.count.mockRejectedValue(error);

      await expect(SubmissionService.getSubmissionCount())
        .rejects.toThrow('Database count failed');
    });
  });
});