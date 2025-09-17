import type { Request, Response } from "express";
import { validateFormData, addressSchema } from "../../validation/form-schemas.js";
import { SessionService } from "../../services/session-service.js";
import { en } from "../../locales/en.js";
import { cy } from "../../locales/cy.js";

export const GET = async (req: Request, res: Response) => {
  // Validate flow progression
  if (!SessionService.validateFlowProgression(req, 'address')) {
    return res.redirect("/onboarding/name");
  }

  const existingData = SessionService.getStepData(req, 'address') || {};

  res.render("onboarding/address", {
    en: en.address,
    cy: cy.address,
    formData: existingData,
    showBackLink: true
  });
};

export const POST = async (req: Request, res: Response) => {
  const validationResult = validateFormData(addressSchema, req.body);

  if (!validationResult.success) {
    return res.render("onboarding/address", {
      en: en.address,
      cy: cy.address,
      errors: validationResult.errors,
      errorSummary: validationResult.errorSummary,
      formData: req.body,
      hasErrors: true,
      showBackLink: true
    });
  }

  // Store validated data in session
  SessionService.updateSession(req, 'address', validationResult.data);

  // Check if returning from summary page
  const returnTo = req.query?.from === 'summary' ? '/onboarding/summary' : '/onboarding/role';
  res.redirect(returnTo);
};