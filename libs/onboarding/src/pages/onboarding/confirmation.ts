import type { Request, Response } from "express";
import { getOnboardingSession, clearOnboardingSession } from "../../onboarding/session.js";
import { ONBOARDING_ROUTES } from "../../onboarding/routes.js";

const en = {
  title: "Onboarding complete",
  heading: "Onboarding complete",
  panelTitle: "Onboarding complete",
  referenceLabel: "Your reference number",
  whatHappensNext: "What happens next",
  nextSteps: "We will process your information and you will be able to access the service.",
  returnButton: "Return to homepage"
};

const cy = {
  title: "Ymgymryd wedi'i gwblhau",
  heading: "Ymgymryd wedi'i gwblhau",
  panelTitle: "Ymgymryd wedi'i gwblhau",
  referenceLabel: "Eich rhif cyfeirnod",
  whatHappensNext: "Beth sy'n digwydd nesaf",
  nextSteps: "Byddwn yn prosesu eich gwybodaeth a byddwch yn gallu cael mynediad at y gwasanaeth.",
  returnButton: "Dychwelyd i'r hafan"
};

export const GET = async (req: Request, res: Response) => {
  const sessionData = getOnboardingSession(req.session);
  const confirmationId = sessionData?.confirmationId;

  // Clear the session after displaying the confirmation
  clearOnboardingSession(req.session);

  if (!confirmationId) {
    return res.redirect(ONBOARDING_ROUTES.START);
  }

  res.render("onboarding/confirmation", {
    confirmationId,
    en,
    cy
  });
};
