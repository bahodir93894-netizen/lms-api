function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value) {
    if (defaultValue === undefined) throw new Error("Missing required environment variable: " + key);
    return defaultValue;
  }
  return value;
}

export const config = {
  port: parseInt(getEnv("PORT", "3001"), 10),
  nodeEnv: getEnv("NODE_ENV", "development"),
  isProduction: getEnv("NODE_ENV", "development") === "production",
  convexUrl: getEnv("CONVEX_URL"),
  jwtSecret: getEnv("JWT_SECRET"),
  corsOrigins: getEnv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
  apiPrefix: getEnv("API_PREFIX", "/api"),
} as const;