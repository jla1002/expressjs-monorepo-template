import type { Request, Response } from "express";

export const GET = async (_req: Request, res: Response) => {
  res.render("about/index", {
    title: "About - HMCTS Monorepo",
    description: "This page was automatically discovered by the file-system router",
  });
};

export const POST = async (req: Request, res: Response) => {
  console.log("POST request to /about with body:", req.body);
  res.json({ message: "POST request handled", data: req.body });
};
