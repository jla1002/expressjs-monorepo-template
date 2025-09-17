import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import { GET, POST } from './date-of-birth.js';
import { SessionService } from '../../services/session-service.js';
import { validateFormData } from '../../validation/form-schemas.js';

// Mock dependencies
vi.mock('../../services/session-service.js');
vi.mock('../../validation/form-schemas.js');

// Mock locale data
vi.mock('../../locales/en.js', () => ({
  en: {
    dateOfBirth: {
      title: 'What is your date of birth?',
      dayLabel: 'Day',
      monthLabel: 'Month',
      yearLabel: 'Year'
    }
  }
}));

vi.mock('../../locales/cy.js', () => ({
  cy: {
    dateOfBirth: {
      title: 'Beth yw eich dyddiad geni?',
      dayLabel: 'Diwrnod',
      monthLabel: 'Mis',
      yearLabel: 'Blwyddyn'
    }
  }
}));

function createMockRequest(body = {}, session = {}, query = {}): Request {
  return {
    body,
    query,
    session: {
      onboarding: session,
      save: vi.fn(),
      regenerate: vi.fn(),
      destroy: vi.fn(),
      reload: vi.fn(),
      touch: vi.fn(),
      id: 'mock-session-id',
      cookie: {} as any,
    }
  } as any;
}

function createMockResponse(): Response {
  return {
    render: vi.fn(),
    redirect: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn(),
  } as any;
}

describe('Date of birth page controller', () => {
  let mockReq: Request;
  let mockRes: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  describe('GET handler', () => {
    it('should render date of birth page when flow progression is valid', async () => {
      const existingData = { day: '15', month: '6', year: '1990' };
      vi.mocked(SessionService.validateFlowProgression).mockReturnValue(true);
      vi.mocked(SessionService.getStepData).mockReturnValue(existingData);

      await GET(mockReq, mockRes);

      expect(SessionService.validateFlowProgression).toHaveBeenCalledWith(mockReq, 'date-of-birth');
      expect(SessionService.getStepData).toHaveBeenCalledWith(mockReq, 'dateOfBirth');
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/date-of-birth', {
        en: {
          title: 'What is your date of birth?',
          dayLabel: 'Day',
          monthLabel: 'Month',
          yearLabel: 'Year'
        },
        cy: {
          title: 'Beth yw eich dyddiad geni?',
          dayLabel: 'Diwrnod',
          monthLabel: 'Mis',
          yearLabel: 'Blwyddyn'
        },
        formData: existingData,
        showBackLink: true
      });
    });

    it('should render date of birth page with empty data when no existing data', async () => {
      vi.mocked(SessionService.validateFlowProgression).mockReturnValue(true);
      vi.mocked(SessionService.getStepData).mockReturnValue(undefined);

      await GET(mockReq, mockRes);

      expect(SessionService.validateFlowProgression).toHaveBeenCalledWith(mockReq, 'date-of-birth');
      expect(SessionService.getStepData).toHaveBeenCalledWith(mockReq, 'dateOfBirth');
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/date-of-birth', {
        en: {
          title: 'What is your date of birth?',
          dayLabel: 'Day',
          monthLabel: 'Month',
          yearLabel: 'Year'
        },
        cy: {
          title: 'Beth yw eich dyddiad geni?',
          dayLabel: 'Diwrnod',
          monthLabel: 'Mis',
          yearLabel: 'Blwyddyn'
        },
        formData: {},
        showBackLink: true
      });
    });

    it('should redirect to name page when flow progression is invalid', async () => {
      vi.mocked(SessionService.validateFlowProgression).mockReturnValue(false);

      await GET(mockReq, mockRes);

      expect(SessionService.validateFlowProgression).toHaveBeenCalledWith(mockReq, 'date-of-birth');
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/name');
      expect(mockRes.render).not.toHaveBeenCalled();
      expect(SessionService.getStepData).not.toHaveBeenCalled();
    });
  });

  describe('POST handler', () => {
    it('should redirect to next step when validation succeeds', async () => {
      const formData = { day: '15', month: '6', year: '1990' };
      const validationResult = { success: true, data: formData };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(SessionService.updateSession).toHaveBeenCalledWith(mockReq, 'dateOfBirth', formData);
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/address');
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    it('should render page with errors when validation fails', async () => {
      const formData = { day: '', month: '6', year: '1990' };
      const validationResult = {
        success: false,
        errors: {
          day: { text: 'Enter a day', href: '#day' }
        },
        errorSummary: [
          { text: 'Enter a day', href: '#day' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/date-of-birth', {
        en: {
          title: 'What is your date of birth?',
          dayLabel: 'Day',
          monthLabel: 'Month',
          yearLabel: 'Year'
        },
        cy: {
          title: 'Beth yw eich dyddiad geni?',
          dayLabel: 'Diwrnod',
          monthLabel: 'Mis',
          yearLabel: 'Blwyddyn'
        },
        errors: validationResult.errors,
        errorSummary: validationResult.errorSummary,
        formData: formData,
        hasErrors: true,
        showBackLink: true
      });
      expect(SessionService.updateSession).not.toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should render page with multiple validation errors', async () => {
      const formData = { day: '', month: '', year: '' };
      const validationResult = {
        success: false,
        errors: {
          day: { text: 'Enter a day', href: '#day' },
          month: { text: 'Enter a month', href: '#month' },
          year: { text: 'Enter a year', href: '#year' }
        },
        errorSummary: [
          { text: 'Enter a day', href: '#day' },
          { text: 'Enter a month', href: '#month' },
          { text: 'Enter a year', href: '#year' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/date-of-birth', {
        en: {
          title: 'What is your date of birth?',
          dayLabel: 'Day',
          monthLabel: 'Month',
          yearLabel: 'Year'
        },
        cy: {
          title: 'Beth yw eich dyddiad geni?',
          dayLabel: 'Diwrnod',
          monthLabel: 'Mis',
          yearLabel: 'Blwyddyn'
        },
        errors: validationResult.errors,
        errorSummary: validationResult.errorSummary,
        formData: formData,
        hasErrors: true,
        showBackLink: true
      });
      expect(SessionService.updateSession).not.toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should handle age validation errors correctly', async () => {
      const formData = { day: '1', month: '1', year: '2010' }; // Too young
      const validationResult = {
        success: false,
        errors: {
          year: { text: 'You must be at least 16 years old', href: '#year' }
        },
        errorSummary: [
          { text: 'You must be at least 16 years old', href: '#year' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/date-of-birth', {
        en: {
          title: 'What is your date of birth?',
          dayLabel: 'Day',
          monthLabel: 'Month',
          yearLabel: 'Year'
        },
        cy: {
          title: 'Beth yw eich dyddiad geni?',
          dayLabel: 'Diwrnod',
          monthLabel: 'Mis',
          yearLabel: 'Blwyddyn'
        },
        errors: validationResult.errors,
        errorSummary: validationResult.errorSummary,
        formData: formData,
        hasErrors: true,
        showBackLink: true
      });
      expect(SessionService.updateSession).not.toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should handle invalid date validation errors', async () => {
      const formData = { day: '31', month: '2', year: '2000' }; // February 31st
      const validationResult = {
        success: false,
        errors: {
          day: { text: 'Enter a real date', href: '#day' }
        },
        errorSummary: [
          { text: 'Enter a real date', href: '#day' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/date-of-birth', {
        en: {
          title: 'What is your date of birth?',
          dayLabel: 'Day',
          monthLabel: 'Month',
          yearLabel: 'Year'
        },
        cy: {
          title: 'Beth yw eich dyddiad geni?',
          dayLabel: 'Diwrnod',
          monthLabel: 'Mis',
          yearLabel: 'Blwyddyn'
        },
        errors: validationResult.errors,
        errorSummary: validationResult.errorSummary,
        formData: formData,
        hasErrors: true,
        showBackLink: true
      });
      expect(SessionService.updateSession).not.toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });
  });
});