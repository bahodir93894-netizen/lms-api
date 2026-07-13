import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const CreateModuleSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional().default(""),
  order: z.number().int().min(0).optional(),
});

const UpdateModuleSchema = CreateModuleSchema.partial();

r.get("/course/:courseId", asyncHandler(async (req, res) => {
  const modules = await convexQuery("modules:listByCourse", { courseId: req.params.courseId });
  successResponse(res, modules);
}));

r.get("/:id", asyncHandler(async (req, res) => {
  const mod = await convexQuery("modules:get", { moduleId: req.params.id });
  if (!mod) { apiError(res, 404, "NOT_FOUND", "Module not found"); return; }
  successResponse(res, mod);
}));

r.post("/", requireAuth, asyncHandler(async (req, res) => {
  const body = CreateModuleSchema.parse(req.body);
  const id = await convexMutation("modules:create", body, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

r.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const body = UpdateModuleSchema.parse(req.body);
  await convexMutation("modules:update", { moduleId: req.params.id, ...body }, req.authToken);
  successResponse(res, { success: true });
}));

r.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("modules:remove", { moduleId: req.params.id }, req.authToken);
  successResponse(res, { success: true });
}));

export default r;