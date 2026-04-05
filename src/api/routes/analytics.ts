import { Hono } from "hono";
import * as v from "valibot";
import type { Env } from "../index";

const FeedbackSchema = v.object({
  grades: v.array(v.object({ questionId: v.number() })),
  weak_topics: v.array(v.string()),
});

export const analyticsRoutes = new Hono<Env>();

analyticsRoutes.get("/weakpoints", async (c) => {
  const db = c.get("db");

  const attempts = await db
    .selectFrom("test_attempts")
    .innerJoin("weeks", "weeks.id", "test_attempts.week_id")
    .innerJoin("courses", "courses.id", "weeks.course_id")
    .select([
      "test_attempts.feedback_json",
      "test_attempts.score",
      "test_attempts.max_score",
      "weeks.title as weekTitle",
      "weeks.id as weekId",
      "courses.title as courseTitle",
    ])
    .orderBy("test_attempts.attempted_at", "desc")
    .execute();

  const topicStats = new Map<
    string,
    { count: number; totalScore: number; totalMax: number; weeks: Set<number> }
  >();

  for (const attempt of attempts) {
    if (!attempt.feedback_json) continue;

    let json: unknown;
    try {
      json = JSON.parse(attempt.feedback_json);
    } catch {
      continue;
    }
    const parsed = v.safeParse(FeedbackSchema, json);
    if (!parsed.success) continue;

    for (const topic of parsed.output.weak_topics) {
      const existing = topicStats.get(topic) ?? {
        count: 0,
        totalScore: 0,
        totalMax: 0,
        weeks: new Set<number>(),
      };
      existing.count += 1;
      existing.totalScore += attempt.score;
      existing.totalMax += attempt.max_score;
      existing.weeks.add(attempt.weekId);
      topicStats.set(topic, existing);
    }
  }

  const weakpoints = [...topicStats.entries()]
    .map(([topic, stats]) => ({
      topic,
      count: stats.count,
      avgScore:
        stats.totalMax > 0
          ? Math.round((stats.totalScore / stats.totalMax) * 100)
          : 0,
      weekIds: [...stats.weeks],
    }))
    .sort((a, b) => b.count - a.count);

  return c.json(weakpoints);
});
