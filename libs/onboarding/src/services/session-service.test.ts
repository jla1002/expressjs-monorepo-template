import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request } from 'express';
import { SessionService } from './session-service.js';

// Mock request object with session
function createMockRequest(sessionData?: any): Request {
  return {
    session: {
      onboarding: sessionData,
      save: vi.fn(),
      regenerate: vi.fn(),
      destroy: vi.fn(),
      reload: vi.fn(),
      touch: vi.fn(),
      id: 'mock-session-id',
      cookie: {} as any,
    },
  } as any;
}

describe('SessionService', () => {
  let mockReq: Request;

  beforeEach(() => {
    mockReq = createMockRequest();
  });

  describe('initializeSession', () => {
    it('should create new session if none exists', () => {
      const session = SessionService.initializeSession(mockReq);

      expect(session).toEqual({
        formData: {},
        currentStep: 'name',
        completedSteps: [],
        startedAt: expect.any(Date),
        lastActivity: expect.any(Date)
      });
    });

    it('should return existing session if already initialized', () => {
      const existingSession = {
        formData: { name: { firstName: 'John', lastName: 'Doe' } },
        currentStep: 'address',
        completedSteps: ['name', 'date-of-birth'],
        startedAt: new Date('2023-01-01'),
        lastActivity: new Date('2023-01-02')
      };

      mockReq = createMockRequest(existingSession);
      const session = SessionService.initializeSession(mockReq);

      expect(session).toEqual(existingSession);
    });
  });

  describe('updateSession', () => {
    it('should update session with step data', () => {
      const stepData = { firstName: 'Jane', lastName: 'Smith' };

      SessionService.updateSession(mockReq, 'name', stepData);

      expect(mockReq.session.onboarding.formData.name).toEqual(stepData);
      expect(mockReq.session.onboarding.currentStep).toBe('name');
      expect(mockReq.session.onboarding.completedSteps).toContain('name');
      expect(mockReq.session.onboarding.lastActivity).toBeInstanceOf(Date);
    });

    it('should not duplicate completed steps', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });
      SessionService.updateSession(mockReq, 'name', { firstName: 'Jane', lastName: 'Smith' });

      expect(mockReq.session.onboarding.completedSteps).toEqual(['name']);
    });
  });

  describe('getStepData', () => {
    it('should return step data when it exists', () => {
      const nameData = { firstName: 'John', lastName: 'Doe' };
      SessionService.updateSession(mockReq, 'name', nameData);

      const result = SessionService.getStepData(mockReq, 'name');

      expect(result).toEqual(nameData);
    });

    it('should return undefined when step data does not exist', () => {
      const result = SessionService.getStepData(mockReq, 'address');

      expect(result).toBeUndefined();
    });

    it('should return undefined when session does not exist', () => {
      mockReq.session.onboarding = undefined;
      const result = SessionService.getStepData(mockReq, 'name');

      expect(result).toBeUndefined();
    });
  });

  describe('getAllFormData', () => {
    it('should return all form data when session exists', () => {
      const nameData = { firstName: 'John', lastName: 'Doe' };
      const addressData = { address1: '123 Test St', townCity: 'London', postcode: 'SW1A 1AA' };

      SessionService.updateSession(mockReq, 'name', nameData);
      SessionService.updateSession(mockReq, 'address', addressData);

      const result = SessionService.getAllFormData(mockReq);

      expect(result).toEqual({
        name: nameData,
        address: addressData
      });
    });

    it('should return empty object when session does not exist', () => {
      mockReq.session.onboarding = undefined;
      const result = SessionService.getAllFormData(mockReq);

      expect(result).toEqual({});
    });
  });

  describe('isStepCompleted', () => {
    it('should return true when step is completed', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });

      const result = SessionService.isStepCompleted(mockReq, 'name');

      expect(result).toBe(true);
    });

    it('should return false when step is not completed', () => {
      const result = SessionService.isStepCompleted(mockReq, 'address');

      expect(result).toBe(false);
    });

    it('should return false when session does not exist', () => {
      mockReq.session.onboarding = undefined;
      const result = SessionService.isStepCompleted(mockReq, 'name');

      expect(result).toBe(false);
    });
  });

  describe('validateFlowProgression', () => {
    it('should allow access to first step (name) without existing session', () => {
      mockReq.session.onboarding = undefined;
      const result = SessionService.validateFlowProgression(mockReq, 'name');

      expect(result).toBe(true);
    });

    it('should prevent access to later steps without session', () => {
      mockReq.session.onboarding = undefined;
      const result = SessionService.validateFlowProgression(mockReq, 'address');

      expect(result).toBe(false);
    });

    it('should allow backward navigation', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });
      SessionService.updateSession(mockReq, 'date-of-birth', { day: '1', month: '1', year: '1990' });

      const result = SessionService.validateFlowProgression(mockReq, 'name');

      expect(result).toBe(true);
    });

    it('should allow access to summary from any completed step', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });

      const result = SessionService.validateFlowProgression(mockReq, 'summary');

      expect(result).toBe(true);
    });

    it('should prevent skipping steps', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });

      const result = SessionService.validateFlowProgression(mockReq, 'address');

      expect(result).toBe(false);
    });

    it('should allow progression to next step when all previous are completed', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });
      SessionService.updateSession(mockReq, 'date-of-birth', { day: '1', month: '1', year: '1990' });

      const result = SessionService.validateFlowProgression(mockReq, 'address');

      expect(result).toBe(true);
    });
  });

  describe('hasCompletedPreviousSteps', () => {
    it('should return true when all previous steps are completed', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });
      SessionService.updateSession(mockReq, 'date-of-birth', { day: '1', month: '1', year: '1990' });

      const result = SessionService.hasCompletedPreviousSteps(mockReq, 2); // address index

      expect(result).toBe(true);
    });

    it('should return false when previous steps are missing', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });

      const result = SessionService.hasCompletedPreviousSteps(mockReq, 2); // address index

      expect(result).toBe(false);
    });

    it('should return false when session does not exist', () => {
      mockReq.session.onboarding = undefined;
      const result = SessionService.hasCompletedPreviousSteps(mockReq, 1);

      expect(result).toBe(false);
    });
  });

  describe('isFormComplete', () => {
    it('should return true when all required steps are completed', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });
      SessionService.updateSession(mockReq, 'date-of-birth', { day: '1', month: '1', year: '1990' });
      SessionService.updateSession(mockReq, 'address', { address1: '123 Test St', townCity: 'London', postcode: 'SW1A 1AA' });
      SessionService.updateSession(mockReq, 'role', { role: 'frontend' });

      const result = SessionService.isFormComplete(mockReq);

      expect(result).toBe(true);
    });

    it('should return false when required steps are missing', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });
      SessionService.updateSession(mockReq, 'date-of-birth', { day: '1', month: '1', year: '1990' });

      const result = SessionService.isFormComplete(mockReq);

      expect(result).toBe(false);
    });
  });

  describe('getPreviousStep', () => {
    it('should return previous step in flow', () => {
      expect(SessionService.getPreviousStep('date-of-birth')).toBe('name');
      expect(SessionService.getPreviousStep('address')).toBe('date-of-birth');
      expect(SessionService.getPreviousStep('role')).toBe('address');
      expect(SessionService.getPreviousStep('summary')).toBe('role');
    });

    it('should return null for first step', () => {
      expect(SessionService.getPreviousStep('name')).toBeNull();
    });

    it('should return null for invalid step', () => {
      expect(SessionService.getPreviousStep('invalid')).toBeNull();
    });
  });

  describe('getNextStep', () => {
    it('should return next step in flow', () => {
      expect(SessionService.getNextStep('name')).toBe('date-of-birth');
      expect(SessionService.getNextStep('date-of-birth')).toBe('address');
      expect(SessionService.getNextStep('address')).toBe('role');
      expect(SessionService.getNextStep('role')).toBe('summary');
    });

    it('should return null for last step', () => {
      expect(SessionService.getNextStep('summary')).toBeNull();
    });

    it('should return null for invalid step', () => {
      expect(SessionService.getNextStep('invalid')).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should clear existing session data', () => {
      SessionService.updateSession(mockReq, 'name', { firstName: 'John', lastName: 'Doe' });

      SessionService.clearSession(mockReq);

      expect(mockReq.session.onboarding).toBeUndefined();
    });

    it('should handle clearing when no session exists', () => {
      mockReq.session.onboarding = undefined;

      expect(() => SessionService.clearSession(mockReq)).not.toThrow();
    });
  });

  describe('generateReferenceNumber', () => {
    it('should generate reference number in correct format', () => {
      const refNumber = SessionService.generateReferenceNumber();

      expect(refNumber).toMatch(/^\d{4}-\d{4}-\d{4}-\d{4}$/);
    });

    it('should generate unique reference numbers', () => {
      const ref1 = SessionService.generateReferenceNumber();
      const ref2 = SessionService.generateReferenceNumber();

      expect(ref1).not.toBe(ref2);
    });

    it('should generate 16-digit padded timestamp', () => {
      const refNumber = SessionService.generateReferenceNumber();
      const digits = refNumber.replace(/-/g, '');

      expect(digits).toHaveLength(16);
      expect(/^\d+$/.test(digits)).toBe(true);
    });
  });

  describe('setReferenceNumber and getReferenceNumber', () => {
    it('should store and retrieve reference number', () => {
      const refNumber = '1234-5678-9012-3456';

      SessionService.setReferenceNumber(mockReq, refNumber);
      const result = SessionService.getReferenceNumber(mockReq);

      expect(result).toBe(refNumber);
    });

    it('should return undefined when no reference number is set', () => {
      const result = SessionService.getReferenceNumber(mockReq);

      expect(result).toBeUndefined();
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format date correctly', () => {
      const dateData = { day: '15', month: '6', year: '1990' };
      const result = SessionService.formatDateForDisplay(dateData);

      expect(result).toBe('15 June 1990');
    });

    it('should handle single digit day and month', () => {
      const dateData = { day: '5', month: '1', year: '2000' };
      const result = SessionService.formatDateForDisplay(dateData);

      expect(result).toBe('5 January 2000');
    });

    it('should handle different months correctly', () => {
      const dateData = { day: '25', month: '12', year: '1995' };
      const result = SessionService.formatDateForDisplay(dateData);

      expect(result).toBe('25 December 1995');
    });
  });

  describe('formatAddressForDisplay', () => {
    it('should format full address with all fields', () => {
      const addressData = {
        address1: '123 Test Street',
        address2: 'Apartment 4B',
        townCity: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA'
      };

      const result = SessionService.formatAddressForDisplay(addressData);

      expect(result).toEqual([
        '123 Test Street',
        'Apartment 4B',
        'London',
        'Greater London',
        'SW1A 1AA'
      ]);
    });

    it('should format address without optional fields', () => {
      const addressData = {
        address1: '456 Main Road',
        townCity: 'Birmingham',
        postcode: 'B1 1AA'
      };

      const result = SessionService.formatAddressForDisplay(addressData);

      expect(result).toEqual([
        '456 Main Road',
        'Birmingham',
        'B1 1AA'
      ]);
    });

    it('should format address with only address2 missing', () => {
      const addressData = {
        address1: '789 High Street',
        townCity: 'Manchester',
        county: 'Greater Manchester',
        postcode: 'M1 1AA'
      };

      const result = SessionService.formatAddressForDisplay(addressData);

      expect(result).toEqual([
        '789 High Street',
        'Manchester',
        'Greater Manchester',
        'M1 1AA'
      ]);
    });
  });
});