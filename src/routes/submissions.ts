import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const CreateSubmissionSchema = z.object({
  assignmentId: z.string().min(1),
  content: z.string().min(1),
  attachmentUrls: z.array(z.string().url()).optional().default([]),
});

r.post("/", requireAuth, asyncHandler(async (req, res) => {
  const body = CreateSubmissionSchema.parse(req.body);
  const id = await convexMutation("submissions:create", { ...body, userId: req.userId }, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

r.get("/my", requireAuth, asyncHandler(async (req, res) => {
  const submissions = await convexQuery("submissions:listByUser", { userId: req.userId }, req.authToken);
  successResponse(res, submissions);
}));

r.get("/assignment/:assignmentId", requireAuth, asyncHandler(async (req, res) => {
  const submissions = await convexQuery("submissions:listByAssignment", { assignmentId: req.params.assignmentId }, req.authToken);
  successResponse(res, submissions);
}));

r.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const submission = await convexQuery("submissions:get", { submissionId: req.params.id }, req.authToken);
  if (!submission) { apiError(res, 404, "NOT_FOUND", "Submission not found"); return; }
  successResponse(res, submission);
}));

r.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("submissions:remove", { submissionId: req.params.id }, req.authToken);
  successResponse(res, { success: true });
}));

export default r;