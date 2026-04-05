import { Hono } from "hono";
import { sql } from "kysely";
import * as v from "valibot";
import { UpdateProgressRequestSchema } from "../../models/progress";
import type { Env } from "../index";

export const weeksRoutes = new Hono<Env>();

weeksRoutes.get("/courses/:courseId/weeks", async (c) => {
  const courseId = Number(c.req.param("courseId"));
  const db = c.get("db");

  const weeks = await db
    .selectFrom("weeks")
    .leftJoin("progress", "progress.week_id", "weeks.id")
    .select([
      "weeks.id",
      "weeks.course_id as courseId",
      "weeks.week_number as weekNumber",
      "weeks.title",
      "weeks.keywords",
      "weeks.is_test as isTest",
      sql<string>`coalesce(progress.status, 'not_started')`.as("status"),
      sql<number | null>`progress.test_score`.as("testScore"),
    ])
    .where("weeks.course_id", "=", courseId)
    .orderBy("weeks.week_number", "asc")
    .execute();

  return c.json(weeks);
});

weeksRoutes.get("/weeks/:weekId", async (c) => {
  const weekId = Number(c.req.param("weekId"));
  const db = c.get("db");

  const week = await db
    .selectFrom("weeks")
    .innerJoin("courses", "courses.id", "weeks.course_id")
    .leftJoin("progress", "progress.week_id", "weeks.id")
    .select([
      "weeks.id",
      "weeks.course_id as courseId",
      "weeks.week_number as weekNumber",
      "weeks.title",
      "weeks.keywords",
      "weeks.is_test as isTest",
      "courses.title as courseTitle",
      sql<string>`coalesce(progress.status, 'not_started')`.as("status"),
      sql<number | null>`progress.test_score`.as("testScore"),
      sql<string | null>`progress.test_notes`.as("testNotes"),
      sql<string | null>`progress.started_at`.as("startedAt"),
      sql<string | null>`progress.completed_at`.as("completedAt"),
    ])
    .where("weeks.id", "=", weekId)
    .executeTakeFirst();

  if (!week) {
    return c.json({ error: "Week not found" }, 404);
  }

  return c.json(week);
});

weeksRoutes.put("/weeks/:weekId/progress", async (c) => {
  const weekId = Number(c.req.param("weekId"));
  const body = await c.req.json();
  const result = v.safeParse(UpdateProgressRequestSchema, body);
  if (!result.success) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const { status, testScore, testNotes } = result.output;
  const db = c.get("db");

  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  const week = await db
    .selectFrom("weeks")
    .select("id")
    .where("id", "=", weekId)
    .executeTakeFirst();

  if (!week) {
    return c.json({ error: "Week not found" }, 404);
  }

  await db
    .insertInto("progress")
    .values({
      week_id: weekId,
      status,
      test_score: testScore ?? null,
      test_notes: testNotes ?? null,
      started_at: now,
      completed_at: status === "test_done" ? now : null,
      updated_at: now,
    })
    .onConflict((oc) =>
      oc.column("week_id").doUpdateSet({
        status,
        test_score: testScore ?? null,
        test_notes: testNotes ?? null,
        completed_at: status === "test_done" ? now : null,
        updated_at: now,
      }),
    )
    .execute();

  return c.json({ ok: true });
});
