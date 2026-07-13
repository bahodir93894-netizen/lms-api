import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  preferences: z.record(z.unknown()).optional(),
});

r.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const user = await convexQuery("users:get", { userId: req.userId }, req.authToken);
  if (!user) { apiError(res, 404, "NOT_FOUND", "User not found"); return; }
  successResponse(res, user);
}));

r.patch("/me", requireAuth, asyncHandler(async (req, res) => {
  const body = UpdateProfileSchema.parse(req.body);
  await convexMutation("users:update", { userId: req.userId, ...body }, req.authToken);
  successResponse(res, { success: true });
}));

r.get("/:id", asyncHandler(async (req, res) => {
  const user = await convexQuery("users:get", { userId: req.params.id });
  if (!user) { apiError(res, 404, "NOT_FOUND", "User not found"); return; }
  successResponse(res, user);
}));

export default r;