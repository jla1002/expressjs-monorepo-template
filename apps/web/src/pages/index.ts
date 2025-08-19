import type { Request, Response } from "express";

export const GET = async (_req: Request, res: Response) => {
  res.render("index", {
    en: {
      title: "HMCTS Monorepo Template",
      description: "This is the home page of the Express Monorepo Service",
    },
    cy: {
      title: "Templed Monorepo HMCTS",
      description: "Dyma dudalen gartref y Gwasanaeth Monorepo Express",
    },
  });
};
