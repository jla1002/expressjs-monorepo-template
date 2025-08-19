import type { Request, Response } from "express";

export const GET = async (_req: Request, res: Response) => {
  // Use translations from res.locals (already populated by middleware)
  res.render("about/index", {
    title: res.locals.pages?.about?.title || "About - HMCTS Monorepo",
    description: res.locals.pages?.about?.description || "This page was automatically discovered by the file-system router",
  });
};

export const POST = async (req: Request, res: Response) => {
  console.log("POST request to /about with body:", req.body);
  res.json({ message: "POST request handled", data: req.body });
};
