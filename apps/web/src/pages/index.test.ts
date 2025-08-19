import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./index.js";

describe("index page", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      render: vi.fn(),
    };
  });

  describe("GET", () => {
    it("should render index template with language-specific content", async () => {
      await GET(req as Request, res as Response);

      expect(res.render).toHaveBeenCalledWith("index", {
        en: {
          title: "HMCTS Monorepo Template",
          description: "This is the home page of the Express Monorepo Service",
        },
        cy: {
          title: "Templed Monorepo HMCTS",
          description: "Dyma dudalen gartref y Gwasanaeth Monorepo Express",
        },
      });
    });

    it("should be an async function", () => {
      expect(GET).toBeInstanceOf(Function);
      expect(GET.constructor.name).toBe("AsyncFunction");
    });

    it("should call render exactly once", async () => {
      await GET(req as Request, res as Response);

      expect(res.render).toHaveBeenCalledTimes(1);
    });

    it("should not modify request object", async () => {
      const originalReq = { ...req };

      await GET(req as Request, res as Response);

      expect(req).toEqual(originalReq);
    });
  });
});
