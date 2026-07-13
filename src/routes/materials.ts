import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const CreateMaterialSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1).max(200),
  type: z.enum(["pdf", "video", "link", "file", "embed"]),
  url: z.string().url(),
  description: z.string().optional().default(""),
  order: z.number().int().min(0).optional(),
});

const UpdateMaterialSchema = CreateMaterialSchema.partial();

r.get("/lesson/:lessonId", asyncHandler(async (req, res) => {
  const materials = await convexQuery("materials:listByLesson", { lessonId: req.params.lessonId });
  successResponse(res, materials);
}));

r.get("/:id", asyncHandler(async (req, res) => {
  const material = await convexQuery("materials:get", { materialId: req.params.id });
  if (!material) { apiError(res, 404, "NOT_FOUND", "Material not found"); return; }
  successResponse(res, material);
}));

r.post("/", requireAuth, asyncHandler(async (req, res) => {
  const body = CreateMaterialSchema.parse(req.body);
  const id = await convexMutation("materials:create", body, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

r.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const body = UpdateMaterialSchema.parse(req.body);
  await convexMutation("materials:update", { materialId: req.params.id, ...body }, req.authToken);
  successResponse(res, { success: true });
}));

r.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("materials:remove", { materialId: req.params.id }, req.authToken);
  successResponse(res, { success: true });
}));

export default r;