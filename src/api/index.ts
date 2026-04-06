import { Hono } from "hono";
import type { Kysely } from "kysely";
import type { Database } from "./db";
import { createDb } from "./db";
import { authMiddleware } from "./middleware/auth";
import { analyticsRoutes } from "./routes/analytics";
import { audioRoutes } from "./routes/audio";
import { authRoutes } from "./routes/auth";
import { coursesRoutes } from "./routes/courses";
import { dashboardRoutes } from "./routes/dashboard";
import { feedRoutes } from "./routes/feed";
import { markersRoutes } from "./routes/markers";
import { testsRoutes } from "./routes/tests";
import { weeksRoutes } from "./routes/weeks";

export type Env = {
  Bindings: {
    DB: D1Database;
    CONTENT_BUCKET: R2Bucket;
    JWT_SECRET: string;
  };
  Variables: {
    db: Kysely<Database>;
    userId: number;
  };
};

const app = new Hono<Env>();

app.use("/api/*", async (c, next) => {
  const db = createDb(c.env.DB);
  c.set("db", db);
  await next();
});

app.route("/api/auth", authRoutes);
app.route("/api/audio", audioRoutes);
app.route("", feedRoutes);

app.use("/api/*", async (c, next) => {
  const path = c.req.path;
  if (path.startsWith("/api/auth/") || path.startsWith("/api/audio/")) {
    return next();
  }
  return authMiddleware(c, next);
});
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/courses", coursesRoutes);
app.route("/api/analytics", analyticsRoutes);
app.route("/api/markers", markersRoutes);
app.route("/api", testsRoutes);
app.route("/api", weeksRoutes);

export default app;
