import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const EnrollSchema = z.object({ courseId: z.string().min(1) });

r.post("/", requireAuth, asyncHandler(async (req, res) => {
  const body = EnrollSchema.parse(req.body);
  const id = await convexMutation("enrollments:enroll", { ...body, userId: req.userId }, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

r.get("/my", requireAuth, asyncHandler(async (req, res) => {
  const enrollments = await convexQuery("enrollments:listByUser", { userId: req.userId }, req.authToken);
  successResponse(res, enrollments);
}));

r.get("/course/:courseId", requireAuth, asyncHandler(async (req, res) => {
  const enrollments = await convexQuery("enrollments:listByCourse", { courseId: req.params.courseId }, req.authToken);
  successResponse(res, enrollments);
}));

r.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("enrollments:unEnroll", { enrollmentId: req.params.id }, req.authToken);
  successResponse(res, { success: true });
}));

export default r;