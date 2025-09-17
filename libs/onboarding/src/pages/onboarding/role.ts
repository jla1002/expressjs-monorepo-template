import type { Request, Response } from "express";
import { validateFormData, roleSchema } from "../../validation/form-schemas.js";
import { SessionService } from "../../services/session-service.js";
import { en } from "../../locales/en.js";
import { cy } from "../../locales/cy.js";

export const GET = async (req: Request, res: Response) => {
  // Validate flow progression
  if (!SessionService.validateFlowProgression(req, 'role')) {
    return res.redirect("/onboarding/name");
  }

  const existingData = SessionService.getStepData(req, 'role') || {};

  res.render("onboarding/role", {
    en: en.role,
    cy: cy.role,
    formData: existingData,
    showBackLink: true
  });
};

export const POST = async (req: Request, res: Response) => {
  const validationResult = validateFormData(roleSchema, req.body);

  if (!validationResult.success) {
    return res.render("onboarding/role", {
      en: en.role,
      cy: cy.role,
      errors: validationResult.errors,
      errorSummary: validationResult.errorSummary,
      formData: req.body,
      hasErrors: true,
      showBackLink: true
    });
  }

  // Store validated data in session
  SessionService.updateSession(req, 'role', validationResult.data);

  // Always redirect to summary page (whether new or returning)
  res.redirect("/onboarding/summary");
};