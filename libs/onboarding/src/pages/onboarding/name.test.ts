import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { GET, POST } from "./name.js";

// Mock service helpers
vi.mock("../../onboarding/service.js", () => ({
  processNameSubmission: vi.fn(),
  getSessionDataForPage: vi.fn()
}));

// Mock navigation helpers
vi.mock("../../onboarding/navigation.js", () => ({
  getPreviousPage: vi.fn(() => "/onboarding/start")
}));

import { processNameSubmission, getSessionDataForPage } from "../../onboarding/service.js";
import { getPreviousPage } from "../../onboarding/navigation.js";

const mockRequest = (overrides = {}) =>
  ({
    session: {},
    body: {},
    query: {},
    ...overrides
  }) as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.render = vi.fn();
  res.redirect = vi.fn();
  return res;
};

describe("Name page controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getSessionDataForPage as any).mockReturnValue(undefined);
    (getPreviousPage as any).mockReturnValue("/onboarding/start");
  });

  describe("GET", () => {
    it("should render the name page with empty form when no session data", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await GET(req, res);

      expect(res.render).toHaveBeenCalledWith("onboarding/name", {
        data: undefined,
        previousPage: "/onboarding/start",
        en: expect.objectContaining({
          title: "What is your name?",
          firstNameLabel: "First name",
          lastNameLabel: "Last name"
        }),
        cy: expect.objectContaining({
          title: "Beth yw eich enw?",
          firstNameLabel: "Enw cyntaf"
        }),
        back: expect.any(Object),
        continue: expect.any(Object)
      });
    });

    it("should render with existing session data", async () => {
      const sessionData = { firstName: "John", lastName: "Doe" };
      (getSessionDataForPage as any).mockReturnValue(sessionData);

      const req = mockRequest();
      const res = mockResponse();

      await GET(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "onboarding/name",
        expect.objectContaining({
          data: { firstName: "John", lastName: "Doe" }
        })
      );
    });
  });

  describe("POST", () => {
    it("should validate and save valid form data", async () => {
      const req = mockRequest({
        body: { firstName: "John", lastName: "Doe" }
      });
      const res = mockResponse();

      await POST(req, res);

      expect(processNameSubmission).toHaveBeenCalledWith(req.session, {
        firstName: "John",
        lastName: "Doe"
      });
      expect(res.redirect).toHaveBeenCalledWith("/onboarding/date-of-birth");
    });

    it("should redirect to summary when return=summary query param", async () => {
      const req = mockRequest({
        body: { firstName: "John", lastName: "Doe" },
        query: { return: "summary" }
      });
      const res = mockResponse();

      await POST(req, res);

      expect(res.redirect).toHaveBeenCalledWith("/onboarding/summary");
    });
  });
});
