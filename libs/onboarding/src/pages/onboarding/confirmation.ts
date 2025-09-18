import type { Request, Response } from "express";

const en = {
  title: "Onboarding complete",
  heading: "Onboarding complete",
  panelTitle: "Onboarding complete",
  body: "Your onboarding has been submitted.",
  whatHappensNext: "What happens next",
  nextSteps: "We will process your information and you will be able to access the service.",
  returnButton: "Return to homepage"
};

const cy = {
  title: "Ymgymryd wedi'i gwblhau",
  heading: "Ymgymryd wedi'i gwblhau",
  panelTitle: "Ymgymryd wedi'i gwblhau",
  body: "Mae eich ymgymryd wedi'i gyflwyno.",
  whatHappensNext: "Beth sy'n digwydd nesaf",
  nextSteps: "Byddwn yn prosesu eich gwybodaeth a byddwch yn gallu cael mynediad at y gwasanaeth.",
  returnButton: "Dychwelyd i'r hafan"
};

export const GET = async (_req: Request, res: Response) => {
  res.render("onboarding/confirmation", {
    en,
    cy
  });
};
