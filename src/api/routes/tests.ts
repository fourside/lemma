import { Hono } from "hono";
import type { Kysely } from "kysely";
import * as v from "valibot";
import {
  GradeTestRequestSchema,
  type TestQuestion,
  TestQuestionSchema,
} from "../../models/test";
import type { Database } from "../db";
import type { Env } from "../index";
import { gradeAnswer } from "../services/claude";
import { getTestPool } from "../services/r2";
import { nowISO } from "../utils/date";

async function loadTestQuestions(
  db: Kysely<Database>,
  bucket: R2Bucket,
  weekId: number,
): Promise<{ questions: TestQuestion[]; weekId: number } | null> {
  const week = await db
    .selectFrom("weeks")
    .innerJoin("courses", "courses.id", "weeks.course_id")
    .select(["weeks.week_number", "courses.id as courseId"])
    .where("weeks.id", "=", weekId)
    .executeTakeFirst();

  if (!week) return null;

  const slug = `course${week.courseId}-week${week.week_number}`;
  const pool = await getTestPool(bucket, `tests/${slug}.json`);
  if (!pool) return null;

  return {
    questions: v.parse(v.array(TestQuestionSchema), pool),
    weekId,
  };
}

export const testsRoutes = new Hono<Env>();

testsRoutes.post("/weeks/:weekId/generate-test", async (c) => {
  const weekId = Number(c.req.param("weekId"));
  const result = await loadTestQuestions(
    c.get("db"),
    c.env.CONTENT_BUCKET,
    weekId,
  );

  if (!result) {
    return c.json({ error: "Week or test pool not found" }, 404);
  }

  const count = Math.min(result.questions.length, 8);
  const shuffled = result.questions
    .map((q) => ({ q, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ q }) => q);

  return c.json({ questions: shuffled.slice(0, count) });
});

testsRoutes.post("/weeks/:weekId/grade-test", async (c) => {
  const weekId = Number(c.req.param("weekId"));
  const body = await c.req.json();
  const parseResult = v.safeParse(GradeTestRequestSchema, body);
  if (!parseResult.success) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const { answers } = parseResult.output;
  const db = c.get("db");

  const pool = await loadTestQuestions(db, c.env.CONTENT_BUCKET, weekId);
  if (!pool) {
    return c.json({ error: "Week or test pool not found" }, 404);
  }

  const questionMap = new Map(pool.questions.map((q) => [q.id, q]));

  const grades = await Promise.all(
    answers
      .filter((ans) => questionMap.has(ans.questionId))
      .map(async (ans) => {
        const question = questionMap.get(ans.questionId);
        if (!question) throw new Error("unreachable");

        const grade = await gradeAnswer(
          question.question,
          question.rubric,
          question.max_score,
          ans.answer,
          c.env.ANTHROPIC_API_KEY,
        );
        return { ...grade, questionId: ans.questionId };
      }),
  );

  const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
  const maxScore = grades.reduce((sum, g) => sum + g.max_score, 0);
  const allWeakTopics = [...new Set(grades.flatMap((g) => g.weak_topics))];

  await db
    .insertInto("test_attempts")
    .values({
      week_id: weekId,
      score: totalScore,
      max_score: maxScore,
      answers_json: JSON.stringify(answers),
      feedback_json: JSON.stringify({
        grades,
        weak_topics: allWeakTopics,
      }),
      attempted_at: nowISO(),
    })
    .execute();

  return c.json({
    score: totalScore,
    maxScore,
    grades,
    weakTopics: allWeakTopics,
  });
});
