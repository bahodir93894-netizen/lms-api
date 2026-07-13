import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const CreateCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional().default(""),
  category: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().min(0).optional().default(0),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

r.get("/", asyncHandler(async (req, res) => {
  const courses = await convexQuery("courses:listPublished", {});
  successResponse(res, courses);
}));

r.get("/all", requireAuth, asyncHandler(async (req, res) => {
  const courses = await convexQuery("courses:listAll", {}, req.authToken);
  successResponse(res, courses);
}));

r.get("/:id", asyncHandler(async (req, res) => {
  const course = await convexQuery("courses:get", { courseId: req.params.id });
  if (!course) { apiError(res, 404, "NOT_FOUND", "Course not found"); return; }
  successResponse(res, course);
}));

r.post("/", requireAuth, asyncHandler(async (req, res) => {
  const body = CreateCourseSchema.parse(req.body);
  const id = await convexMutation("courses:create", body, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

r.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const body = UpdateCourseSchema.parse(req.body);
  await convexMutation("courses:update", { courseId: req.params.id, ...body }, req.authToken);
  successResponse(res, { success: true });
}));

r.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("courses:remove", { courseId: req.params.id }, req.authToken);
  successResponse(res, { success: true });
}));

export default r;