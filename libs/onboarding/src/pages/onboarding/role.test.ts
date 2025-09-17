import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import { GET, POST } from './role.js';
import { SessionService } from '../../services/session-service.js';
import { validateFormData } from '../../validation/form-schemas.js';

// Mock dependencies
vi.mock('../../services/session-service.js');
vi.mock('../../validation/form-schemas.js');

// Mock locale data
vi.mock('../../locales/en.js', () => ({
  en: {
    role: {
      title: 'What is your role?',
      frontendLabel: 'Frontend Developer',
      backendLabel: 'Backend Developer',
      testEngineerLabel: 'Test Engineer',
      otherLabel: 'Other',
      otherInputLabel: 'Please specify your role'
    }
  }
}));

vi.mock('../../locales/cy.js', () => ({
  cy: {
    role: {
      title: 'Beth yw eich rôl?',
      frontendLabel: 'Datblygwr Pen Blaen',
      backendLabel: 'Datblygwr Pen Ôl',
      testEngineerLabel: 'Peiriannydd Profi',
      otherLabel: 'Arall',
      otherInputLabel: 'Nodwch eich rôl os gwelwch yn dda'
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

describe('Role page controller', () => {
  let mockReq: Request;
  let mockRes: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  describe('GET handler', () => {
    it('should render role page when flow progression is valid', async () => {
      const existingData = { role: 'frontend' };
      vi.mocked(SessionService.validateFlowProgression).mockReturnValue(true);
      vi.mocked(SessionService.getStepData).mockReturnValue(existingData);

      await GET(mockReq, mockRes);

      expect(SessionService.validateFlowProgression).toHaveBeenCalledWith(mockReq, 'role');
      expect(SessionService.getStepData).toHaveBeenCalledWith(mockReq, 'role');
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/role', {
        en: {
          title: 'What is your role?',
          frontendLabel: 'Frontend Developer',
          backendLabel: 'Backend Developer',
          testEngineerLabel: 'Test Engineer',
          otherLabel: 'Other',
          otherInputLabel: 'Please specify your role'
        },
        cy: {
          title: 'Beth yw eich rôl?',
          frontendLabel: 'Datblygwr Pen Blaen',
          backendLabel: 'Datblygwr Pen Ôl',
          testEngineerLabel: 'Peiriannydd Profi',
          otherLabel: 'Arall',
          otherInputLabel: 'Nodwch eich rôl os gwelwch yn dda'
        },
        formData: existingData,
        showBackLink: true
      });
    });

    it('should render role page with empty data when no existing data', async () => {
      vi.mocked(SessionService.validateFlowProgression).mockReturnValue(true);
      vi.mocked(SessionService.getStepData).mockReturnValue(undefined);

      await GET(mockReq, mockRes);

      expect(SessionService.validateFlowProgression).toHaveBeenCalledWith(mockReq, 'role');
      expect(SessionService.getStepData).toHaveBeenCalledWith(mockReq, 'role');
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/role', {
        en: {
          title: 'What is your role?',
          frontendLabel: 'Frontend Developer',
          backendLabel: 'Backend Developer',
          testEngineerLabel: 'Test Engineer',
          otherLabel: 'Other',
          otherInputLabel: 'Please specify your role'
        },
        cy: {
          title: 'Beth yw eich rôl?',
          frontendLabel: 'Datblygwr Pen Blaen',
          backendLabel: 'Datblygwr Pen Ôl',
          testEngineerLabel: 'Peiriannydd Profi',
          otherLabel: 'Arall',
          otherInputLabel: 'Nodwch eich rôl os gwelwch yn dda'
        },
        formData: {},
        showBackLink: true
      });
    });

    it('should redirect to name page when flow progression is invalid', async () => {
      vi.mocked(SessionService.validateFlowProgression).mockReturnValue(false);

      await GET(mockReq, mockRes);

      expect(SessionService.validateFlowProgression).toHaveBeenCalledWith(mockReq, 'role');
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/name');
      expect(mockRes.render).not.toHaveBeenCalled();
      expect(SessionService.getStepData).not.toHaveBeenCalled();
    });
  });

  describe('POST handler', () => {
    it('should redirect to summary when validation succeeds with predefined role', async () => {
      const formData = { role: 'frontend' };
      const validationResult = { success: true, data: formData };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(SessionService.updateSession).toHaveBeenCalledWith(mockReq, 'role', formData);
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/summary');
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    it('should redirect to summary when validation succeeds with other role', async () => {
      const formData = { role: 'other', otherRole: 'DevOps Engineer' };
      const validationResult = { success: true, data: formData };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(SessionService.updateSession).toHaveBeenCalledWith(mockReq, 'role', formData);
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/summary');
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    it('should render page with errors when no role is selected', async () => {
      const formData = {};
      const validationResult = {
        success: false,
        errors: {
          role: { text: 'Select your role', href: '#role' }
        },
        errorSummary: [
          { text: 'Select your role', href: '#role' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/role', {
        en: {
          title: 'What is your role?',
          frontendLabel: 'Frontend Developer',
          backendLabel: 'Backend Developer',
          testEngineerLabel: 'Test Engineer',
          otherLabel: 'Other',
          otherInputLabel: 'Please specify your role'
        },
        cy: {
          title: 'Beth yw eich rôl?',
          frontendLabel: 'Datblygwr Pen Blaen',
          backendLabel: 'Datblygwr Pen Ôl',
          testEngineerLabel: 'Peiriannydd Profi',
          otherLabel: 'Arall',
          otherInputLabel: 'Nodwch eich rôl os gwelwch yn dda'
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

    it('should render page with errors when other role is selected but not specified', async () => {
      const formData = { role: 'other' };
      const validationResult = {
        success: false,
        errors: {
          otherRole: { text: 'Enter your role', href: '#otherRole' }
        },
        errorSummary: [
          { text: 'Enter your role', href: '#otherRole' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/role', {
        en: {
          title: 'What is your role?',
          frontendLabel: 'Frontend Developer',
          backendLabel: 'Backend Developer',
          testEngineerLabel: 'Test Engineer',
          otherLabel: 'Other',
          otherInputLabel: 'Please specify your role'
        },
        cy: {
          title: 'Beth yw eich rôl?',
          frontendLabel: 'Datblygwr Pen Blaen',
          backendLabel: 'Datblygwr Pen Ôl',
          testEngineerLabel: 'Peiriannydd Profi',
          otherLabel: 'Arall',
          otherInputLabel: 'Nodwch eich rôl os gwelwch yn dda'
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

    it('should render page with errors when other role is too short', async () => {
      const formData = { role: 'other', otherRole: 'A' };
      const validationResult = {
        success: false,
        errors: {
          otherRole: { text: 'Role must be at least 2 characters', href: '#otherRole' }
        },
        errorSummary: [
          { text: 'Role must be at least 2 characters', href: '#otherRole' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/role', {
        en: {
          title: 'What is your role?',
          frontendLabel: 'Frontend Developer',
          backendLabel: 'Backend Developer',
          testEngineerLabel: 'Test Engineer',
          otherLabel: 'Other',
          otherInputLabel: 'Please specify your role'
        },
        cy: {
          title: 'Beth yw eich rôl?',
          frontendLabel: 'Datblygwr Pen Blaen',
          backendLabel: 'Datblygwr Pen Ôl',
          testEngineerLabel: 'Peiriannydd Profi',
          otherLabel: 'Arall',
          otherInputLabel: 'Nodwch eich rôl os gwelwch yn dda'
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

    it('should render page with errors when other role is too long', async () => {
      const longRole = 'a'.repeat(101);
      const formData = { role: 'other', otherRole: longRole };
      const validationResult = {
        success: false,
        errors: {
          otherRole: { text: 'Role must be 100 characters or fewer', href: '#otherRole' }
        },
        errorSummary: [
          { text: 'Role must be 100 characters or fewer', href: '#otherRole' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/role', {
        en: {
          title: 'What is your role?',
          frontendLabel: 'Frontend Developer',
          backendLabel: 'Backend Developer',
          testEngineerLabel: 'Test Engineer',
          otherLabel: 'Other',
          otherInputLabel: 'Please specify your role'
        },
        cy: {
          title: 'Beth yw eich rôl?',
          frontendLabel: 'Datblygwr Pen Blaen',
          backendLabel: 'Datblygwr Pen Ôl',
          testEngineerLabel: 'Peiriannydd Profi',
          otherLabel: 'Arall',
          otherInputLabel: 'Nodwch eich rôl os gwelwch yn dda'
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

    it('should handle all predefined role options correctly', async () => {
      const roles = ['frontend', 'backend', 'testEngineer'];

      for (const role of roles) {
        vi.clearAllMocks();
        const formData = { role };
        const validationResult = { success: true, data: formData };

        mockReq = createMockRequest(formData);
        vi.mocked(validateFormData).mockReturnValue(validationResult);

        await POST(mockReq, mockRes);

        expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
        expect(SessionService.updateSession).toHaveBeenCalledWith(mockReq, 'role', formData);
        expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/summary');
      }
    });
  });
});