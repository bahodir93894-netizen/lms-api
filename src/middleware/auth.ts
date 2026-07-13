import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config.js";
import { apiError } from "../utils/api-handler.js";

declare global {
  namespace Express {
    interface Request {
      authToken?: string;
      authPayload?: JwtPayload;
      userId?: string;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const h = req.headers.authorization;
  if (h?.startsWith("Bearer ")) {
    req.authToken = h.slice(7);
    try {
      const d = jwt.verify(req.authToken, config.jwtSecret, { algorithms: ["HS256"] }) as JwtPayload;
      if (d) { req.authPayload = d; req.userId = d.sub; }
    } catch (err) {
      if (!config.isProduction) {
        console.warn("[AUTH_WARN] Token verification failed:", err instanceof Error ? err.message : "Unknown error");
      }
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) { apiError(res, 401, "UNAUTHORIZED", "Authentication required"); return; }
  req.authToken = h.slice(7);
  try {
    const d = jwt.verify(req.authToken, config.jwtSecret, { algorithms: ["HS256"] }) as JwtPayload;
    if (!d || !d.sub) { apiError(res, 401, "UNAUTHORIZED", "Invalid token payload"); return; }
    req.authPayload = d;
    req.userId = d.sub;
    next();
  } catch (err) {
    apiError(res, 401, "UNAUTHORIZED", err instanceof Error ? err.message : "Invalid or expired token");
  }
}