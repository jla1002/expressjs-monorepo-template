import type { Request, Response } from "express";

export const GET = async (_req: Request, res: Response) => {
  res.render("index", {
    en: {
      title: "Privacy Policy"
    },
    cy: {
      title: "Polisi Preifatr"
    },
  });
};
