import { Hono } from "hono";
import { sql } from "kysely";
import type { Env } from "../index";

export const coursesRoutes = new Hono<Env>();

coursesRoutes.get("/", async (c) => {
  const db = c.get("db");

  const courses = await db
    .selectFrom("courses")
    .leftJoin("weeks", "weeks.course_id", "courses.id")
    .leftJoin("progress", "progress.week_id", "weeks.id")
    .select([
      "courses.id",
      "courses.phase",
      "courses.title",
      "courses.subtitle",
      "courses.sort_order as sortOrder",
      sql<number>`count(weeks.id)`.as("totalWeeks"),
      sql<number>`sum(case when progress.status = 'test_done' then 1 else 0 end)`.as(
        "completedWeeks",
      ),
    ])
    .groupBy("courses.id")
    .orderBy("courses.sort_order", "asc")
    .execute();

  return c.json(courses);
});
