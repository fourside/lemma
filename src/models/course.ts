import * as v from "valibot";

export const CourseWithProgressSchema = v.object({
  id: v.number(),
  phase: v.number(),
  title: v.string(),
  subtitle: v.nullable(v.string()),
  sortOrder: v.number(),
  totalWeeks: v.number(),
  completedWeeks: v.number(),
});

export type CourseWithProgress = v.InferOutput<typeof CourseWithProgressSchema>;
