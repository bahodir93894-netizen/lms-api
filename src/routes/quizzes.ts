import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, successResponse, apiError } from "../utils/api-handler.js";
import { convexQuery, convexMutation } from "../convex.js";

const r = Router();

const QuestionSchema = z.object({
  text: z.string().min(1),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.number().int().min(0),
  points: z.number().int().min(1).optional().default(1),
});

const CreateQuizSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional().default(""),
  passingScore: z.number().int().min(0).max(100).optional().default(70),
  questions: z.array(QuestionSchema).min(1).max(50),
  timeLimit: z.number().int().min(0).optional(),
});

const UpdateQuizSchema = CreateQuizSchema.partial();
const AnswerSchema = z.object({
  questionIndex: z.number().int().min(0),
  selectedAnswer: z.number().int().min(0),
});

const SubmitQuizSchema = z.object({
  answers: z.array(AnswerSchema).min(1),
});

r.get("/lesson/:lessonId", asyncHandler(async (req, res) => {
  const quizzes = await convexQuery("quizzes:listByLesson", { lessonId: req.params.lessonId });
  successResponse(res, quizzes);
}));

r.get("/:id", asyncHandler(async (req, res) => {
  const quiz = await convexQuery("quizzes:get", { quizId: req.params.id });
  if (!quiz) { apiError(res, 404, "NOT_FOUND", "Quiz not found"); return; }
  successResponse(res, quiz);
}));

r.post("/", requireAuth, asyncHandler(async (req, res) => {
  const body = CreateQuizSchema.parse(req.body);
  const id = await convexMutation("quizzes:create", body, req.authToken);
  successResponse(res, { _id: id }, 201);
}));

r.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const body = UpdateQuizSchema.parse(req.body);
  await convexMutation("quizzes:update", { quizId: req.params.id, ...body }, req.authToken);
  successResponse(res, { success: true });
}));

r.post("/:id/submit", requireAuth, asyncHandler(async (req, res) => {
  const body = SubmitQuizSchema.parse(req.body);
  const result = await convexMutation("quizzes:submit", { quizId: req.params.id, ...body }, req.authToken);
  successResponse(res, result, 201);
}));

r.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await convexMutation("quizzes:remove", { quizId: req.params.id }, req.authToken);
  successResponse(res, { success: true });
}));

export default r;