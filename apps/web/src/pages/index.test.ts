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
    it("should render index template with title", async () => {
      await GET(req as Request, res as Response);

      expect(res.render).toHaveBeenCalledWith("index", {
        title: "HMCTS Monorepo Template",
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
