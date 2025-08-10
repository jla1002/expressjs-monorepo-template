import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticate() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);

      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret") as any;

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: "Token expired" });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: "Invalid token" });
      }
      return res.status(500).json({ error: "Authentication error" });
    }
  };
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return req.cookies?.token || null;
}
