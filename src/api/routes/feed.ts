import { Hono } from "hono";
import type { Env } from "../index";
import { r2KeyToSlug } from "../services/r2";

export const feedRoutes = new Hono<Env>();

feedRoutes.get("/feed.xml", async (c) => {
  const db = c.get("db");

  const episodes = await db
    .selectFrom("audio_episodes")
    .innerJoin("weeks", "weeks.id", "audio_episodes.week_id")
    .innerJoin("courses", "courses.id", "weeks.course_id")
    .select([
      "audio_episodes.r2_key",
      "audio_episodes.duration_seconds",
      "audio_episodes.generated_at",
      "weeks.title as weekTitle",
      "weeks.week_number",
      "courses.title as courseTitle",
    ])
    .orderBy("audio_episodes.generated_at", "desc")
    .execute();

  const baseUrl = new URL(c.req.url).origin;

  const items = episodes
    .map((ep) => {
      const slug = r2KeyToSlug(ep.r2_key);
      const title = `${ep.courseTitle} - ${ep.weekTitle}`;
      const duration = ep.duration_seconds ?? 0;
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;

      return `    <item>
      <title>${escapeXml(title)}</title>
      <enclosure url="${baseUrl}/api/audio/${slug}.m4a" type="audio/mp4" />
      <pubDate>${new Date(ep.generated_at).toUTCString()}</pubDate>
      <itunes:duration>${mins}:${String(secs).padStart(2, "0")}</itunes:duration>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Lemma CS Lectures</title>
    <description>CS self-study audio lectures</description>
    <language>ja</language>
${items}
  </channel>
</rss>`;

  return c.body(xml, 200, {
    "Content-Type": "application/rss+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
