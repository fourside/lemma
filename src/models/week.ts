import * as v from "valibot";

export const ProgressStatusSchema = v.picklist([
  "not_started",
  "audio_done",
  "text_done",
  "test_done",
]);

export type ProgressStatus = v.InferOutput<typeof ProgressStatusSchema>;

export const WeekWithProgressSchema = v.object({
  id: v.number(),
  courseId: v.number(),
  weekNumber: v.number(),
  title: v.string(),
  keywords: v.nullable(v.string()),
  isTest: v.union([v.boolean(), v.number()]),
  status: ProgressStatusSchema,
  testScore: v.nullable(v.number()),
});

export type WeekWithProgress = v.InferOutput<typeof WeekWithProgressSchema>;

export const WeekDetailSchema = v.object({
  ...WeekWithProgressSchema.entries,
  courseTitle: v.string(),
  testNotes: v.nullable(v.string()),
  startedAt: v.nullable(v.string()),
  completedAt: v.nullable(v.string()),
});

export type WeekDetail = v.InferOutput<typeof WeekDetailSchema>;
