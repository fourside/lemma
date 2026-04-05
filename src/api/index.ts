import { Hono } from "hono";
import type { Kysely } from "kysely";
import type { Database } from "./db";
import { createDb } from "./db";
import { authMiddleware } from "./middleware/auth";
import { authRoutes } from "./routes/auth";
import { coursesRoutes } from "./routes/courses";
import { dashboardRoutes } from "./routes/dashboard";
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

app.use("/api/*", authMiddleware);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/courses", coursesRoutes);
app.route("/api", weeksRoutes);

export default app;
