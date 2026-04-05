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
import { testsRoutes } from "./routes/tests";
import { weeksRoutes } from "./routes/weeks";

export type Env = {
  Bindings: {
    DB: D1Database;
    CONTENT_BUCKET: R2Bucket;
    JWT_SECRET: string;
    ANTHROPIC_API_KEY: string;
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
app.route("", feedRoutes);

app.use("/api/*", authMiddleware);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/courses", coursesRoutes);
app.route("/api/audio", audioRoutes);
app.route("/api/analytics", analyticsRoutes);
app.route("/api", testsRoutes);
app.route("/api", weeksRoutes);

export default app;
