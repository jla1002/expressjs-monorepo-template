import type { Request, Response } from "express";
import { SessionService } from "../../services/session-service.js";
import { SubmissionService } from "../../services/submission-service.js";
import { en } from "../../locales/en.js";
import { cy } from "../../locales/cy.js";

export const GET = async (req: Request, res: Response) => {
  // Validate flow progression and ensure all steps completed
  if (!SessionService.isFormComplete(req)) {
    return res.redirect("/onboarding/name");
  }

  const formData = SessionService.getAllFormData(req);

  // Prepare display data
  const displayData = {
    name: `${formData.name?.firstName} ${formData.name?.lastName}`,
    dateOfBirth: formData.dateOfBirth ? SessionService.formatDateForDisplay(formData.dateOfBirth) : '',
    address: formData.address ? SessionService.formatAddressForDisplay(formData.address) : [],
    role: formData.role?.role === 'other'
      ? formData.role.otherRole
      : formData.role?.role ? en.role.options[formData.role.role as keyof typeof en.role.options] : ''
  };

  res.render("onboarding/summary", {
    en: en.summary,
    cy: cy.summary,
    displayData,
    showBackLink: true
  });
};

export const POST = async (req: Request, res: Response) => {
  // Validate that form is complete
  if (!SessionService.isFormComplete(req)) {
    return res.redirect("/onboarding/name");
  }

  const formData = SessionService.getAllFormData(req);

  try {
    // Generate reference number and save to session
    const referenceNumber = SessionService.generateReferenceNumber();
    SessionService.setReferenceNumber(req, referenceNumber);

    // Save to database
    await SubmissionService.saveSubmission(formData as any, referenceNumber);

    // Redirect to confirmation
    res.redirect("/onboarding/confirmation");
  } catch (error) {
    console.error("Error submitting onboarding form:", error);

    // Handle error - could render error page or return to summary with error
    return res.render("onboarding/summary", {
      en: en.summary,
      cy: cy.summary,
      displayData: {
        name: `${formData.name?.firstName} ${formData.name?.lastName}`,
        dateOfBirth: formData.dateOfBirth ? SessionService.formatDateForDisplay(formData.dateOfBirth) : '',
        address: formData.address ? SessionService.formatAddressForDisplay(formData.address) : [],
        role: formData.role?.role === 'other'
          ? formData.role.otherRole
          : formData.role?.role ? en.role.options[formData.role.role as keyof typeof en.role.options] : ''
      },
      showBackLink: true,
      hasErrors: true,
      errorSummary: [{ text: "There was a problem submitting your application. Please try again.", href: "#submit" }]
    });
  }
};