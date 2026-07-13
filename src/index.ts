import "express-rate-limit";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { config } from "./config.js";
import { swaggerSpec } from "./swagger.js";
import { optionalAuth } from "./middleware/auth.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";
import { apiLimiter } from "./middleware/rate-limit.js";
import { logger } from "./middleware/logger.js";
import courseRoutes from "./routes/courses.js";
import moduleRoutes from "./routes/modules.js";
import lessonRoutes from "./routes/lessons.js";
import quizRoutes from "./routes/quizzes.js";
import assignmentRoutes from "./routes/assignments.js";
import submissionRoutes from "./routes/submissions.js";
import enrollmentRoutes from "./routes/enrollments.js";
import userRoutes from "./routes/users.js";
import analyticsRoutes from "./routes/analytics.js";
import certificateRoutes from "./routes/certificates.js";
import notificationRoutes from "./routes/notifications.js";
import importRoutes from "./routes/imports.js";
import materialRoutes from "./routes/materials.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));
app.use(logger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(config.apiPrefix, apiLimiter);
app.use(optionalAuth);

app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

app.use(config.apiPrefix + "/courses", courseRoutes);
app.use(config.apiPrefix + "/modules", moduleRoutes);
app.use(config.apiPrefix + "/lessons", lessonRoutes);
app.use(config.apiPrefix + "/quizzes", quizRoutes);
app.use(config.apiPrefix + "/assignments", assignmentRoutes);
app.use(config.apiPrefix + "/submissions", submissionRoutes);
app.use(config.apiPrefix + "/enrollments", enrollmentRoutes);
app.use(config.apiPrefix + "/users", userRoutes);
app.use(config.apiPrefix + "/analytics", analyticsRoutes);
app.use(config.apiPrefix + "/certificates", certificateRoutes);
app.use(config.apiPrefix + "/notifications", notificationRoutes);
app.use(config.apiPrefix + "/imports", importRoutes);
app.use(config.apiPrefix + "/materials", materialRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log("🚀 LMS API running on port " + config.port);
  console.log("📚 Swagger docs at http://localhost:" + config.port + "/docs");
});

export default app;