import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery } from "../convex.js";

const r = Router();

const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

r.get("/dashboard", requireAuth, asyncHandler(async (req, res) => {
  const stats = await convexQuery("analytics:dashboard", {}, req.authToken);
  successResponse(res, stats);
}));

r.get("/courses", requireAuth, asyncHandler(async (req, res) => {
  const stats = await convexQuery("analytics:courses", {}, req.authToken);
  successResponse(res, stats);
}));

r.get("/users", requireAuth, asyncHandler(async (req, res) => {
  const query = DateRangeSchema.parse(req.query);
  const stats = await convexQuery("analytics:users", query, req.authToken);
  successResponse(res, stats);
}));

r.get("/revenue", requireAuth, asyncHandler(async (req, res) => {
  const query = DateRangeSchema.parse(req.query);
  const stats = await convexQuery("analytics:revenue", query, req.authToken);
  successResponse(res, stats);
}));

r.get("/engagement", requireAuth, asyncHandler(async (req, res) => {
  const stats = await convexQuery("analytics:engagement", {}, req.authToken);
  successResponse(res, stats);
}));

export default r;