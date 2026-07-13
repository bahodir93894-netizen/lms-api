import morgan from "morgan";

const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

export const logger = morgan(morganFormat, {
  skip: (req) => req.path === "/health" || req.path.startsWith("/docs")
});