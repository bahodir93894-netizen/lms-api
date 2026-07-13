import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const CreateLessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().optional().default(""),
  videoUrl: z.string().url().optional().or(z.literal("")),
  duration: z.number().int().min(0).optional().default(0),
  order: z.number().int().min(0).optional(),
});

const UpdateLessonSchema = CreateLessonSchema.partial();

r.get("/module/:moduleId", asyncHandler(async (req, res) => {
  const lessons = await convexQuery("lessons:listByModule", { moduleId: req.params.moduleId });
  successResponse(res, lessons);
}));

r.get("/:id", asyncHandler(async (req, res) => {
  const lesson = await convexQuery("lessons:get", { lessonId: req.params.id });
  if (!lesson) { apiError(res, 404, "NOT_FOUND", "Lesson not found"); return; }
  successResponse(res, lesson);
}));

r.post("/", requireAuth, asyncHandler(async (req, res) => {
  const body = CreateLessonSchema.parse(req.body);
  const id = await convexMutation("lessons:create", body, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

r.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const body = UpdateLessonSchema.parse(req.body);
  await convexMutation("lessons:update", { lessonId: req.params.id, ...body }, req.authToken);
  successResponse(res, { success: true });
}));

r.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("lessons:remove", { lessonId: req.params.id }, req.authToken);
  successResponse(res, { success: true });
}));

export default r;