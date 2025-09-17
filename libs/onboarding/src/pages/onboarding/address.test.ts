import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import { GET, POST } from './address.js';
import { SessionService } from '../../services/session-service.js';
import { validateFormData } from '../../validation/form-schemas.js';

// Mock dependencies
vi.mock('../../services/session-service.js');
vi.mock('../../validation/form-schemas.js');

// Mock locale data
vi.mock('../../locales/en.js', () => ({
  en: {
    address: {
      title: 'What is your address?',
      address1Label: 'Address line 1',
      address2Label: 'Address line 2 (optional)',
      townCityLabel: 'Town or city',
      countyLabel: 'County (optional)',
      postcodeLabel: 'Postcode'
    }
  }
}));

vi.mock('../../locales/cy.js', () => ({
  cy: {
    address: {
      title: 'Beth yw eich cyfeiriad?',
      address1Label: 'Llinell cyfeiriad 1',
      address2Label: 'Llinell cyfeiriad 2 (dewisol)',
      townCityLabel: 'Tref neu ddinas',
      countyLabel: 'Sir (dewisol)',
      postcodeLabel: 'Cod post'
    }
  }
}));

function createMockRequest(body = {}, session = {}): Request {
  return {
    body,
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

describe('Address page controller', () => {
  let mockReq: Request;
  let mockRes: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  describe('GET handler', () => {
    it('should render address page when flow progression is valid', async () => {
      const existingData = {
        address1: '123 Test Street',
        address2: 'Apartment 4B',
        townCity: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA'
      };
      vi.mocked(SessionService.validateFlowProgression).mockReturnValue(true);
      vi.mocked(SessionService.getStepData).mockReturnValue(existingData);

      await GET(mockReq, mockRes);

      expect(SessionService.validateFlowProgression).toHaveBeenCalledWith(mockReq, 'address');
      expect(SessionService.getStepData).toHaveBeenCalledWith(mockReq, 'address');
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/address', {
        en: {
          title: 'What is your address?',
          address1Label: 'Address line 1',
          address2Label: 'Address line 2 (optional)',
          townCityLabel: 'Town or city',
          countyLabel: 'County (optional)',
          postcodeLabel: 'Postcode'
        },
        cy: {
          title: 'Beth yw eich cyfeiriad?',
          address1Label: 'Llinell cyfeiriad 1',
          address2Label: 'Llinell cyfeiriad 2 (dewisol)',
          townCityLabel: 'Tref neu ddinas',
          countyLabel: 'Sir (dewisol)',
          postcodeLabel: 'Cod post'
        },
        formData: existingData,
        showBackLink: true
      });
    });

    it('should render address page with empty data when no existing data', async () => {
      vi.mocked(SessionService.validateFlowProgression).mockReturnValue(true);
      vi.mocked(SessionService.getStepData).mockReturnValue(undefined);

      await GET(mockReq, mockRes);

      expect(SessionService.validateFlowProgression).toHaveBeenCalledWith(mockReq, 'address');
      expect(SessionService.getStepData).toHaveBeenCalledWith(mockReq, 'address');
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/address', {
        en: {
          title: 'What is your address?',
          address1Label: 'Address line 1',
          address2Label: 'Address line 2 (optional)',
          townCityLabel: 'Town or city',
          countyLabel: 'County (optional)',
          postcodeLabel: 'Postcode'
        },
        cy: {
          title: 'Beth yw eich cyfeiriad?',
          address1Label: 'Llinell cyfeiriad 1',
          address2Label: 'Llinell cyfeiriad 2 (dewisol)',
          townCityLabel: 'Tref neu ddinas',
          countyLabel: 'Sir (dewisol)',
          postcodeLabel: 'Cod post'
        },
        formData: {},
        showBackLink: true
      });
    });

    it('should redirect to name page when flow progression is invalid', async () => {
      vi.mocked(SessionService.validateFlowProgression).mockReturnValue(false);

      await GET(mockReq, mockRes);

      expect(SessionService.validateFlowProgression).toHaveBeenCalledWith(mockReq, 'address');
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/name');
      expect(mockRes.render).not.toHaveBeenCalled();
      expect(SessionService.getStepData).not.toHaveBeenCalled();
    });
  });

  describe('POST handler', () => {
    it('should redirect to next step when validation succeeds with full address', async () => {
      const formData = {
        address1: '123 Test Street',
        address2: 'Apartment 4B',
        townCity: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA'
      };
      const validationResult = { success: true, data: formData };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(SessionService.updateSession).toHaveBeenCalledWith(mockReq, 'address', formData);
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/role');
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    it('should redirect to next step when validation succeeds with minimal address', async () => {
      const formData = {
        address1: '456 Main Road',
        townCity: 'Birmingham',
        postcode: 'B1 1AA'
      };
      const validationResult = { success: true, data: formData };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(SessionService.updateSession).toHaveBeenCalledWith(mockReq, 'address', formData);
      expect(mockRes.redirect).toHaveBeenCalledWith('/onboarding/role');
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    it('should render page with errors when validation fails - missing required fields', async () => {
      const formData = { address2: 'Apartment 4B', county: 'Greater London' };
      const validationResult = {
        success: false,
        errors: {
          address1: { text: 'Enter address line 1', href: '#address1' },
          townCity: { text: 'Enter town or city', href: '#townCity' },
          postcode: { text: 'Enter postcode', href: '#postcode' }
        },
        errorSummary: [
          { text: 'Enter address line 1', href: '#address1' },
          { text: 'Enter town or city', href: '#townCity' },
          { text: 'Enter postcode', href: '#postcode' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/address', {
        en: {
          title: 'What is your address?',
          address1Label: 'Address line 1',
          address2Label: 'Address line 2 (optional)',
          townCityLabel: 'Town or city',
          countyLabel: 'County (optional)',
          postcodeLabel: 'Postcode'
        },
        cy: {
          title: 'Beth yw eich cyfeiriad?',
          address1Label: 'Llinell cyfeiriad 1',
          address2Label: 'Llinell cyfeiriad 2 (dewisol)',
          townCityLabel: 'Tref neu ddinas',
          countyLabel: 'Sir (dewisol)',
          postcodeLabel: 'Cod post'
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

    it('should render page with errors when postcode is invalid', async () => {
      const formData = {
        address1: '123 Test Street',
        townCity: 'London',
        postcode: 'INVALID'
      };
      const validationResult = {
        success: false,
        errors: {
          postcode: { text: 'Enter a real postcode', href: '#postcode' }
        },
        errorSummary: [
          { text: 'Enter a real postcode', href: '#postcode' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/address', {
        en: {
          title: 'What is your address?',
          address1Label: 'Address line 1',
          address2Label: 'Address line 2 (optional)',
          townCityLabel: 'Town or city',
          countyLabel: 'County (optional)',
          postcodeLabel: 'Postcode'
        },
        cy: {
          title: 'Beth yw eich cyfeiriad?',
          address1Label: 'Llinell cyfeiriad 1',
          address2Label: 'Llinell cyfeiriad 2 (dewisol)',
          townCityLabel: 'Tref neu ddinas',
          countyLabel: 'Sir (dewisol)',
          postcodeLabel: 'Cod post'
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

    it('should render page with errors when fields are too long', async () => {
      const formData = {
        address1: 'a'.repeat(201),
        address2: 'b'.repeat(201),
        townCity: 'c'.repeat(101),
        county: 'd'.repeat(101),
        postcode: 'SW1A 1AA'
      };
      const validationResult = {
        success: false,
        errors: {
          address1: { text: 'Address line 1 must be 200 characters or fewer', href: '#address1' },
          address2: { text: 'Address line 2 must be 200 characters or fewer', href: '#address2' },
          townCity: { text: 'Town or city must be 100 characters or fewer', href: '#townCity' },
          county: { text: 'County must be 100 characters or fewer', href: '#county' }
        },
        errorSummary: [
          { text: 'Address line 1 must be 200 characters or fewer', href: '#address1' },
          { text: 'Address line 2 must be 200 characters or fewer', href: '#address2' },
          { text: 'Town or city must be 100 characters or fewer', href: '#townCity' },
          { text: 'County must be 100 characters or fewer', href: '#county' }
        ]
      };

      mockReq = createMockRequest(formData);
      vi.mocked(validateFormData).mockReturnValue(validationResult);

      await POST(mockReq, mockRes);

      expect(validateFormData).toHaveBeenCalledWith(expect.any(Object), formData);
      expect(mockRes.render).toHaveBeenCalledWith('onboarding/address', {
        en: {
          title: 'What is your address?',
          address1Label: 'Address line 1',
          address2Label: 'Address line 2 (optional)',
          townCityLabel: 'Town or city',
          countyLabel: 'County (optional)',
          postcodeLabel: 'Postcode'
        },
        cy: {
          title: 'Beth yw eich cyfeiriad?',
          address1Label: 'Llinell cyfeiriad 1',
          address2Label: 'Llinell cyfeiriad 2 (dewisol)',
          townCityLabel: 'Tref neu ddinas',
          countyLabel: 'Sir (dewisol)',
          postcodeLabel: 'Cod post'
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