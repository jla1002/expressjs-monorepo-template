import type { Request, Response } from "express";

export const GET = async (_req: Request, res: Response) => {
  res.render("contact-us", {
    en: {
      title: "Contact us",
      sections: {
        sendMessage: {
          heading: "Send us a message",
          linkText: "Send us a message",
        },
        telephone: {
          heading: "Telephone",
        },
        openingHours: {
          heading: "Opening times (telephone)",
          closed: "Closed on bank holidays",
        },
      },
    },
    cy: {
      title: "Cysylltu â ni",
      sections: {
        sendMessage: {
          heading: "Anfonwch neges atom",
          linkText: "Anfonwch neges atom",
        },
        telephone: {
          heading: "Ffôn",
        },
        openingHours: {
          heading: "Oriau agor (ffôn)",
          closed: "Ar gau ar wyliau banc",
        },
      },
    },
  });
};
