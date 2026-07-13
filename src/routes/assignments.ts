import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const CreateAssignmentSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  dueDate: z.string().datetime().optional(),
  maxScore: z.number().int().min(1).optional().default(100),
  attachmentUrls: z.array(z.string().url()).optional().default([]),
});

const UpdateAssignmentSchema = CreateAssignmentSchema.partial();
const GradeAssignmentSchema = z.object({ score: z.number().int().min(0), feedback: z.string().optional() });

r.get("/lesson/:lessonId", asyncHandler(async (req, res) => {
  const assignments = await convexQuery("assignments:listByLesson", { lessonId: req.params.lessonId });
  successResponse(res, assignments);
}));

r.get("/:id", asyncHandler(async (req, res) => {
  const assignment = await convexQuery("assignments:get", { assignmentId: req.params.id });
  if (!assignment) { apiError(res, 404, "NOT_FOUND", "Assignment not found"); return; }
  successResponse(res, assignment);
}));

r.post("/", requireAuth, asyncHandler(async (req, res) => {
  const body = CreateAssignmentSchema.parse(req.body);
  const id = await convexMutation("assignments:create", body, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

r.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const body = UpdateAssignmentSchema.parse(req.body);
  await convexMutation("assignments:update", { assignmentId: req.params.id, ...body }, req.authToken);
  successResponse(res, { success: true });
}));

r.post("/:id/grade", requireAuth, asyncHandler(async (req, res) => {
  const body = GradeAssignmentSchema.parse(req.body);
  await convexMutation("assignments:grade", { assignmentId: req.params.id, ...body }, req.authToken);
  successResponse(res, { success: true });
}));

r.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("assignments:remove", { assignmentId: req.params.id }, req.authToken);
  successResponse(res, { success: true });
}));

export default r;