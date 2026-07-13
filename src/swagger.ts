import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "LMS API", version: "1.0.0", description: "Learning Management System REST API" },
    servers: [{ url: "/api", description: "API server" }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
      schemas: {
        Course: { type: "object", properties: { _id: { type: "string" }, title: { type: "string" }, slug: { type: "string" }, description: { type: "string" }, status: { type: "string", enum: ["draft","published","archived"] }, createdAt: { type: "string", format: "date-time" } } },
        Module: { type: "object", properties: { _id: { type: "string" }, courseId: { type: "string" }, title: { type: "string" }, order: { type: "integer" } } },
        Lesson: { type: "object", properties: { _id: { type: "string" }, moduleId: { type: "string" }, title: { type: "string" }, duration: { type: "integer" } } },
        Quiz: { type: "object", properties: { _id: { type: "string" }, lessonId: { type: "string" }, title: { type: "string" }, passingScore: { type: "integer" }, questions: { type: "array", items: { $ref: "#/components/schemas/Question" } } } },
        Question: { type: "object", properties: { text: { type: "string" }, options: { type: "array", items: { type: "string" } }, correctAnswer: { type: "integer" }, points: { type: "integer" } } },
        Assignment: { type: "object", properties: { _id: { type: "string" }, lessonId: { type: "string" }, title: { type: "string" }, maxScore: { type: "integer" }, dueDate: { type: "string", format: "date-time" } } },
        Error: { type: "object", properties: { error: { type: "string" }, message: { type: "string" }, details: { type: "object" } } }
      }
    },
    paths: {
      "/courses": { get: { tags: ["Courses"], summary: "List published courses", responses: { "200": { description: "Course list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Course" } } } } } } }, post: { tags: ["Courses"], summary: "Create course", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, slug: { type: "string" } } } } } }, responses: { "201": { description: "Created" } } } },
      "/courses/{id}": { get: { tags: ["Courses"], summary: "Get course by ID", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Course details" }, "404": { description: "Not found" } } }, patch: { tags: ["Courses"], summary: "Update course", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated" } } }, delete: { tags: ["Courses"], summary: "Delete course", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deleted" } } } },
      "/modules/course/{courseId}": { get: { tags: ["Modules"], summary: "List course modules", parameters: [{ name: "courseId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Module list" } } } },
      "/modules": { post: { tags: ["Modules"], summary: "Create module", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } } },
      "/lessons/module/{moduleId}": { get: { tags: ["Lessons"], summary: "List module lessons", parameters: [{ name: "moduleId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Lesson list" } } } },
      "/lessons": { post: { tags: ["Lessons"], summary: "Create lesson", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } } },
      "/quizzes/lesson/{lessonId}": { get: { tags: ["Quizzes"], summary: "List lesson quizzes", parameters: [{ name: "lessonId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Quiz list" } } } },
      "/quizzes/{id}/submit": { post: { tags: ["Quizzes"], summary: "Submit quiz answers", security: [{ bearerAuth: [] }], responses: { "200": { description: "Quiz result" } } } },
      "/assignments": { post: { tags: ["Assignments"], summary: "Create assignment", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } } },
      "/submissions": { post: { tags: ["Submissions"], summary: "Submit assignment", security: [{ bearerAuth: [] }], responses: { "201": { description: "Submitted" } } } },
      "/enrollments": { post: { tags: ["Enrollments"], summary: "Enroll in course", security: [{ bearerAuth: [] }], responses: { "201": { description: "Enrolled" } } } },
      "/users/me": { get: { tags: ["Users"], summary: "Get my profile", security: [{ bearerAuth: [] }], responses: { "200": { description: "Profile" } } } },
      "/analytics/dashboard": { get: { tags: ["Analytics"], summary: "Dashboard stats", security: [{ bearerAuth: [] }], responses: { "200": { description: "Statistics" } } } },
      "/certificates/my": { get: { tags: ["Certificates"], summary: "My certificates", security: [{ bearerAuth: [] }], responses: { "200": { description: "Certificates" } } } },
      "/certificates/verify/{code}": { get: { tags: ["Certificates"], summary: "Verify certificate", parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Verified" } } } },
      "/notifications": { get: { tags: ["Notifications"], summary: "My notifications", security: [{ bearerAuth: [] }], responses: { "200": { description: "Notifications" } } } },
      "/imports/courses": { post: { tags: ["Imports"], summary: "Bulk import courses", security: [{ bearerAuth: [] }], responses: { "201": { description: "Imported" } } } },
      "/materials": { post: { tags: ["Materials"], summary: "Add material", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } } }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);