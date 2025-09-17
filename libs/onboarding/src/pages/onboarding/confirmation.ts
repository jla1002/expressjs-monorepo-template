import type { Request, Response } from "express";
import { SessionService } from "../../services/session-service.js";
import { en } from "../../locales/en.js";
import { cy } from "../../locales/cy.js";

export const GET = async (req: Request, res: Response) => {
  // Check if we have a reference number in session
  const referenceNumber = SessionService.getReferenceNumber(req);

  if (!referenceNumber) {
    // No submission found, redirect to start
    return res.redirect("/onboarding/name");
  }

  // Clear session data after successful submission
  SessionService.clearSession(req);

  res.render("onboarding/confirmation", {
    en: en.confirmation,
    cy: cy.confirmation,
    referenceNumber
  });
};