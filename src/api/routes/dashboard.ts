import { Hono } from "hono";
import { sql } from "kysely";
import type { Env } from "../index";

export const dashboardRoutes = new Hono<Env>();

dashboardRoutes.get("/", async (c) => {
  const db = c.get("db");

  const weeks = await db
    .selectFrom("weeks")
    .leftJoin("progress", "progress.week_id", "weeks.id")
    .innerJoin("courses", "courses.id", "weeks.course_id")
    .select([
      "weeks.id as weekId",
      "weeks.title as weekTitle",
      "weeks.week_number as weekNumber",
      "courses.title as courseTitle",
      "courses.sort_order as courseSortOrder",
      sql<string | null>`progress.status`.as("status"),
      sql<number | null>`progress.test_score`.as("testScore"),
      sql<string | null>`progress.completed_at`.as("completedAt"),
    ])
    .orderBy("courses.sort_order", "asc")
    .orderBy("weeks.week_number", "asc")
    .execute();

  const totalWeeks = weeks.length;
  const completedWeeks = weeks.filter((w) => w.status === "test_done").length;
  const completionPercent =
    totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  const nextWeek = weeks.find((w) => w.status !== "test_done") ?? null;

  const recentTest = weeks
    .filter((w) => w.testScore != null && w.completedAt != null)
    .sort((a, b) => ((b.completedAt ?? "") > (a.completedAt ?? "") ? 1 : -1))
    .at(0);

  return c.json({
    totalWeeks,
    completedWeeks,
    completionPercent,
    nextWeek: nextWeek
      ? {
          weekId: nextWeek.weekId,
          courseTitle: nextWeek.courseTitle,
          weekTitle: nextWeek.weekTitle,
          weekNumber: nextWeek.weekNumber,
        }
      : null,
    recentTest: recentTest
      ? {
          weekTitle: recentTest.weekTitle,
          score: recentTest.testScore ?? 0,
        }
      : null,
  });
});
