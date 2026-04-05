import { Hono } from "hono";
import { sql } from "kysely";
import * as v from "valibot";
import { LectureTypeSchema } from "../../models/lecture";
import { UpdateProgressRequestSchema } from "../../models/progress";
import type { Env } from "../index";
import { generateLectureText } from "../services/claude";
import { r2KeyToSlug } from "../services/r2";
import { nowISO } from "../utils/date";

const GenerateLectureRequestSchema = v.object({
  type: LectureTypeSchema,
});

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
    .leftJoin("audio_episodes", "audio_episodes.week_id", "weeks.id")
    .leftJoin(
      (eb) =>
        eb
          .selectFrom("lecture_texts")
          .select(["week_id", "content"])
          .where("type", "=", "text")
          .as("lt_text"),
      (join) => join.onRef("lt_text.week_id", "=", "weeks.id"),
    )
    .leftJoin(
      (eb) =>
        eb
          .selectFrom("lecture_texts")
          .select(["week_id", "content"])
          .where("type", "=", "audio")
          .as("lt_audio"),
      (join) => join.onRef("lt_audio.week_id", "=", "weeks.id"),
    )
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
      sql<string | null>`audio_episodes.r2_key`.as("audioR2Key"),
      sql<number | null>`audio_episodes.duration_seconds`.as("audioDuration"),
      sql<string | null>`lt_text.content`.as("lectureText"),
      sql<string | null>`lt_audio.content`.as("audioLectureText"),
    ])
    .where("weeks.id", "=", weekId)
    .executeTakeFirst();

  if (!week) {
    return c.json({ error: "Week not found" }, 404);
  }

  const slug = week.audioR2Key ? r2KeyToSlug(week.audioR2Key) : null;

  return c.json({
    ...week,
    audioR2Key: undefined,
    audioUrl: slug ? `/api/audio/${slug}.m4a` : null,
  });
});

weeksRoutes.post("/weeks/:weekId/generate-lecture", async (c) => {
  const weekId = Number(c.req.param("weekId"));
  const body = await c.req.json();
  const result = v.safeParse(GenerateLectureRequestSchema, body);
  if (!result.success) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const { type } = result.output;
  const db = c.get("db");

  const week = await db
    .selectFrom("weeks")
    .select(["title", "keywords"])
    .where("id", "=", weekId)
    .executeTakeFirst();

  if (!week) {
    return c.json({ error: "Week not found" }, 404);
  }

  const content = await generateLectureText(
    week.title,
    week.keywords ?? "",
    type,
    c.env.ANTHROPIC_API_KEY,
  );

  const now = nowISO();

  await db
    .insertInto("lecture_texts")
    .values({ week_id: weekId, type, content, generated_at: now })
    .onConflict((oc) =>
      oc
        .columns(["week_id", "type"])
        .doUpdateSet({ content, generated_at: now }),
    )
    .execute();

  return c.json({ content });
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

  const now = nowISO();

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
