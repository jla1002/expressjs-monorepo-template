import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { GET } from "./confirmation.js";

vi.mock("../../onboarding/session.js", () => ({
  getOnboardingSession: vi.fn(),
  clearOnboardingSession: vi.fn()
}));

import { getOnboardingSession, clearOnboardingSession } from "../../onboarding/session.js";

describe("confirmation page", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      session: {} as any
    };
    mockRes = {
      render: vi.fn(),
      redirect: vi.fn()
    };
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should render confirmation page with reference number", async () => {
      const mockSessionData = {
        confirmationId: "test-id-123"
      };

      vi.mocked(getOnboardingSession).mockReturnValue(mockSessionData as any);
      vi.mocked(clearOnboardingSession).mockImplementation(() => {});

      await GET(mockReq as Request, mockRes as Response);

      expect(getOnboardingSession).toHaveBeenCalledWith(mockReq.session);
      expect(clearOnboardingSession).toHaveBeenCalledWith(mockReq.session);
      expect(mockRes.render).toHaveBeenCalledWith(
        "onboarding/confirmation",
        expect.objectContaining({
          confirmationId: "test-id-123",
          en: expect.objectContaining({
            title: "Onboarding complete",
            heading: "Onboarding complete",
            panelTitle: "Onboarding complete",
            referenceLabel: "Your reference number",
            whatHappensNext: "What happens next"
          }),
          cy: expect.objectContaining({
            title: "Ymgymryd wedi'i gwblhau"
          })
        })
      );
    });

    it("should redirect to start when no confirmation ID", async () => {
      vi.mocked(getOnboardingSession).mockReturnValue({} as any);
      vi.mocked(clearOnboardingSession).mockImplementation(() => {});

      await GET(mockReq as Request, mockRes as Response);

      expect(getOnboardingSession).toHaveBeenCalledWith(mockReq.session);
      expect(clearOnboardingSession).toHaveBeenCalledWith(mockReq.session);
      expect(mockRes.redirect).toHaveBeenCalledWith("/onboarding/start");
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    it("should handle null session data gracefully", async () => {
      vi.mocked(getOnboardingSession).mockReturnValue(null as any);
      vi.mocked(clearOnboardingSession).mockImplementation(() => {});

      await GET(mockReq as Request, mockRes as Response);

      expect(getOnboardingSession).toHaveBeenCalledWith(mockReq.session);
      expect(clearOnboardingSession).toHaveBeenCalledWith(mockReq.session);
      expect(mockRes.redirect).toHaveBeenCalledWith("/onboarding/start");
      expect(mockRes.render).not.toHaveBeenCalled();
    });
  });
});
