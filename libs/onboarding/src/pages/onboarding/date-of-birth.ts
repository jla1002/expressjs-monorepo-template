import type { Request, Response } from "express";
import { validateFormData, dateOfBirthSchema } from "../../validation/form-schemas.js";
import { SessionService } from "../../services/session-service.js";
import { en } from "../../locales/en.js";
import { cy } from "../../locales/cy.js";

export const GET = async (req: Request, res: Response) => {
  // Validate flow progression
  if (!SessionService.validateFlowProgression(req, 'date-of-birth')) {
    return res.redirect("/onboarding/name");
  }

  const existingData = SessionService.getStepData(req, 'dateOfBirth') || {};

  res.render("onboarding/date-of-birth", {
    en: en.dateOfBirth,
    cy: cy.dateOfBirth,
    formData: existingData,
    showBackLink: true
  });
};

export const POST = async (req: Request, res: Response) => {
  const validationResult = validateFormData(dateOfBirthSchema, req.body);

  if (!validationResult.success) {
    return res.render("onboarding/date-of-birth", {
      en: en.dateOfBirth,
      cy: cy.dateOfBirth,
      errors: validationResult.errors,
      errorSummary: validationResult.errorSummary,
      formData: req.body,
      hasErrors: true,
      showBackLink: true
    });
  }

  // Store validated data in session
  SessionService.updateSession(req, 'dateOfBirth', validationResult.data);

  // Check if returning from summary page
  const returnTo = req.query?.from === 'summary' ? '/onboarding/summary' : '/onboarding/address';
  res.redirect(returnTo);
};