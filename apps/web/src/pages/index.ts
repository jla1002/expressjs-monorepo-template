import type { Request, Response } from "express";

const en = {
  title: "HMCTS Monorepo Template",
  description: "This is the home page of the Express Monorepo Service",
};

const cy = {
  title: "Templed Monorepo HMCTS",
  description: "Dyma dudalen gartref y Gwasanaeth Monorepo Express",
};

export const GET = async (_req: Request, res: Response) => {
  res.render("index", { en, cy });
};
