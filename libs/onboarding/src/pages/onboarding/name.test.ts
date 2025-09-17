import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import { GET, POST } from './name.js';
import { SessionService } from '../../services/session-service.js';
import { validateFormData } from '../../validation/form-schemas.js';

// Mock dependencies
vi.mock('../../services/session-service.js');
vi.mock('../../validation/form-schemas.js');

// Mock locale data
vi.mock('../../locales/en.js', () => ({
  en: {
    name: {
      title: 'What is your name?',
      firstNameLabel: 'First name',
      lastNameLabel: 'Last name'
    }
  }
}));

vi.mock('../../locales/cy.js', () => ({
  cy: {
    name: {
      title: 'Beth yw eich enw?',
      firstNameLabel: 'Enw cyntaf',
      lastNameLabel: 'Cyfenw'
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

describe('Name page controller', () => {
  let mockReq: Request;
  let mockRes: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  describe('GET handler', () => {
    it('should render name page with empty form data when no existing data', async () => {
      vi.mocked(SessionService.getStepData).mockReturnValue(undefined);

      await GET(mockReq, mockRes);

      expect(SessionService.getStepData).toHaveBeenCalledWith(mockReq, 'name');
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/name', {
        en: {
          title: 'What is your name?',
          firstNameLabel: 'First name',
          lastNameLabel: 'Last name'
        },
        cy: {
          title: 'Beth yw eich enw?',
          firstNameLabel: 'Enw cyntaf',
          lastNameLabel: 'Cyfenw'
        },
        formData: {}
      });
    });

    it('should render name page with existing form data when available', async () => {
      const existingData = { firstName: 'John', lastName: 'Doe' };
      vi.mocked(SessionService.getStepData).mockReturnValue(existingData);

      await GET(mockReq, mockRes);

      expect(SessionService.getStepData).toHaveBeenCalledWith(mockReq, 'name');
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/name', {
        en: {
          title: 'What is your name?',
          firstNameLabel: 'First name',
          lastNameLabel: 'Last name'
        },
        cy: {
          title: 'Beth yw eich enw?',
          firstNameLabel: 'Enw cyntaf',
          lastNameLabel: 'Cyfenw'
        },
        formData: existingData
      });
    });
  });

  describe('POST handler', () => {
    it('should redirect to next step when validation succeeds', async () => {
      const formData = { firstName: 'John', lastName: 'Doe' };
      const validationResult = { success: true, data: formData };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(SessionService.updateSession).toHaveBeenCalledWith(mockReq, 'name', formData);
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/date-of-birth');
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    it('should redirect to summary when coming from summary page', async () => {
      const formData = { firstName: 'John', lastName: 'Doe' };
      const validationResult = { success: true, data: formData };

      mockReq = createMockRequest(formData, {}, { from: 'summary' });
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(SessionService.updateSession).toHaveBeenCalledWith(mockReq, 'name', formData);
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/summary');
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    it('should render page with errors when validation fails', async () => {
      const formData = { firstName: '', lastName: 'Doe' };
      const validationResult = {
        success: false,
        errors: {
          firstName: { text: 'Enter your first name', href: '#firstName' }
        },
        errorSummary: [
          { text: 'Enter your first name', href: '#firstName' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/name', {
        en: {
          title: 'What is your name?',
          firstNameLabel: 'First name',
          lastNameLabel: 'Last name'
        },
        cy: {
          title: 'Beth yw eich enw?',
          firstNameLabel: 'Enw cyntaf',
          lastNameLabel: 'Cyfenw'
        },
        errors: validationResult.errors,
        errorSummary: validationResult.errorSummary,
        formData: formData,
        hasErrors: true
      });
      expect(SessionService.updateSession).not.toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should render page with errors when validation fails with multiple errors', async () => {
      const formData = { firstName: '', lastName: '' };
      const validationResult = {
        success: false,
        errors: {
          firstName: { text: 'Enter your first name', href: '#firstName' },
          lastName: { text: 'Enter your last name', href: '#lastName' }
        },
        errorSummary: [
          { text: 'Enter your first name', href: '#firstName' },
          { text: 'Enter your last name', href: '#lastName' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/name', {
        en: {
          title: 'What is your name?',
          firstNameLabel: 'First name',
          lastNameLabel: 'Last name'
        },
        cy: {
          title: 'Beth yw eich enw?',
          firstNameLabel: 'Enw cyntaf',
          lastNameLabel: 'Cyfenw'
        },
        errors: validationResult.errors,
        errorSummary: validationResult.errorSummary,
        formData: formData,
        hasErrors: true
      });
      expect(SessionService.updateSession).not.toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should handle special characters in names correctly', async () => {
      const formData = { firstName: "Jean-Claude", lastName: "O'Connor" };
      const validationResult = { success: true, data: formData };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(SessionService.updateSession).toHaveBeenCalledWith(mockReq, 'name', formData);
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/date-of-birth');
    });
  });
});