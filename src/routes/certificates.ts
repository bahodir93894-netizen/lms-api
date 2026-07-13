import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const IssueCertificateSchema = z.object({
  courseId: z.string().min(1),
  userId: z.string().min(1),
  grade: z.string().optional(),
});

r.get("/my", requireAuth, asyncHandler(async (req, res) => {
  const certs = await convexQuery("certificates:listByUser", { userId: req.userId }, req.authToken);
  successResponse(res, certs);
}));

r.get("/course/:courseId", requireAuth, asyncHandler(async (req, res) => {
  const cert = await convexQuery("certificates:getByCourseAndUser", { courseId: req.params.courseId, userId: req.userId }, req.authToken);
  if (!cert) { apiError(res, 404, "NOT_FOUND", "Certificate not found"); return; }
  successResponse(res, cert);
}));

r.get("/verify/:code", asyncHandler(async (req, res) => {
  const cert = await convexQuery("certificates:verify", { code: req.params.code });
  if (!cert) { apiError(res, 404, "NOT_FOUND", "Certificate not found or invalid"); return; }
  successResponse(res, cert);
}));

r.post("/issue", requireAuth, asyncHandler(async (req, res) => {
  const body = IssueCertificateSchema.parse(req.body);
  const id = await convexMutation("certificates:issue", body, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

export default r;