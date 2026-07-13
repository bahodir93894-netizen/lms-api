import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const SendNotificationSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z.enum(["info", "warning", "success", "error"]).optional().default("info"),
});

r.get("/", requireAuth, asyncHandler(async (req, res) => {
  const notifications = await convexQuery("notifications:listByUser", { userId: req.userId }, req.authToken);
  successResponse(res, notifications);
}));

r.get("/unread-count", requireAuth, asyncHandler(async (req, res) => {
  const count = await convexQuery("notifications:unreadCount", { userId: req.userId }, req.authToken);
  successResponse(res, { count });
}));

r.post("/:id/read", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("notifications:markRead", { notificationId: req.params.id }, req.authToken);
  successResponse(res, { success: true });
}));

r.post("/read-all", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("notifications:markAllRead", { userId: req.userId }, req.authToken);
  successResponse(res, { success: true });
}));

r.post("/send", requireAuth, asyncHandler(async (req, res) => {
  const body = SendNotificationSchema.parse(req.body);
  const id = await convexMutation("notifications:send", body, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

export default r;