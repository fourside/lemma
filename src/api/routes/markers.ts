import { Hono } from "hono";
import * as v from "valibot";
import { CreateMarkerRequestSchema } from "../../models/marker";
import type { Env } from "../index";
import { nowISO } from "../utils/date";

export const markersRoutes = new Hono<Env>();

markersRoutes.get("/", async (c) => {
  const weekId = c.req.query("weekId");
  const db = c.get("db");

  let query = db
    .selectFrom("markers")
    .innerJoin("weeks", "weeks.id", "markers.week_id")
    .innerJoin("courses", "courses.id", "weeks.course_id")
    .select([
      "markers.id",
      "markers.week_id as weekId",
      "markers.text",
      "markers.start_offset as startOffset",
      "markers.length",
      "markers.section_heading as sectionHeading",
      "markers.note",
      "markers.created_at as createdAt",
      "weeks.title as weekTitle",
      "courses.title as courseTitle",
    ])
    .orderBy("markers.created_at", "desc");

  if (weekId) {
    query = query.where("markers.week_id", "=", Number(weekId));
  }

  const markers = await query.execute();
  return c.json(markers);
});

markersRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const result = v.safeParse(CreateMarkerRequestSchema, body);
  if (!result.success) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const { weekId, text, startOffset, length, sectionHeading, note } =
    result.output;
  const db = c.get("db");

  const week = await db
    .selectFrom("weeks")
    .select("id")
    .where("id", "=", weekId)
    .executeTakeFirst();

  if (!week) {
    return c.json({ error: "Week not found" }, 404);
  }

  const inserted = await db
    .insertInto("markers")
    .values({
      week_id: weekId,
      text,
      start_offset: startOffset,
      length,
      section_heading: sectionHeading ?? null,
      note: note ?? null,
      created_at: nowISO(),
    })
    .returning("id")
    .executeTakeFirst();

  return c.json({ id: inserted?.id }, 201);
});

markersRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const db = c.get("db");

  await db.deleteFrom("markers").where("id", "=", id).execute();

  return c.json({ ok: true });
});
