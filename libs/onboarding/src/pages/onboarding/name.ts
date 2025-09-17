import type { Request, Response } from "express";
import { validateFormData, nameSchema } from "../../validation/form-schemas.js";
import { SessionService } from "../../services/session-service.js";
import { en } from "../../locales/en.js";
import { cy } from "../../locales/cy.js";

export const GET = async (req: Request, res: Response) => {
  const existingData = SessionService.getStepData(req, 'name') || {};

  res.render("onboarding/name", {
    en: en.name,
    cy: cy.name,
    formData: existingData
  });
};

export const POST = async (req: Request, res: Response) => {
  const validationResult = validateFormData(nameSchema, req.body);

  if (!validationResult.success) {
    return res.render("onboarding/name", {
      en: en.name,
      cy: cy.name,
      errors: validationResult.errors,
      errorSummary: validationResult.errorSummary,
      formData: req.body,
      hasErrors: true
    });
  }

  // Store validated data in session
  SessionService.updateSession(req, 'name', validationResult.data);

  // Check if returning from summary page
  const returnTo = req.query?.from === 'summary' ? '/onboarding/summary' : '/onboarding/date-of-birth';
  res.redirect(returnTo);
};