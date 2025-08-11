import type { Request, Response } from "express";

export const GET = async (req: Request, res: Response) => {
  res.render("index/index", {
    title: "HMCTS Monorepo Template",
  });
};
