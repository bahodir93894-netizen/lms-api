import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number = 500,
    message: string = "Server Error",
    public errorCode: string = "UNKNOWN_ERROR",
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "NOT_FOUND", message: "The requested resource was not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const isDev = process.env.NODE_ENV === "development";
  console.error("[ERROR]", { message: err instanceof Error ? err.message : "Unknown error", timestamp: new Date().toISOString(), ...(isDev && err instanceof Error ? { stack: err.stack } : {}) });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.errorCode, message: err.message, ...(isDev && err.details !== undefined ? { details: err.details } : {}) });
    return;
  }

  if (err instanceof Error && err.message?.includes("Not authenticated")) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required" });
    return;
  }
  if (err instanceof Error && err.message?.includes("Not authorized")) {
    res.status(403).json({ error: "FORBIDDEN", message: "Access denied" });
    return;
  }

  // Zod validation errors
  if (err && typeof err === "object" && "issues" in err && Array.isArray((err as any).issues)) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: (err as any).issues.map((i: any) => ({ field: i.path?.join(".") || "unknown", message: i.message, code: i.code }))
    });
    return;
  }

  res.status(500).json({ error: "SERVER_ERROR", message: isDev && err instanceof Error ? err.message : "An unexpected error occurred" });
}