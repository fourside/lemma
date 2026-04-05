import * as v from "valibot";

export const DashboardDataSchema = v.object({
  totalWeeks: v.number(),
  completedWeeks: v.number(),
  completionPercent: v.number(),
  nextWeek: v.nullable(
    v.object({
      weekId: v.number(),
      courseTitle: v.string(),
      weekTitle: v.string(),
      weekNumber: v.number(),
    }),
  ),
  recentTest: v.nullable(
    v.object({
      weekTitle: v.string(),
      score: v.number(),
    }),
  ),
});

export type DashboardData = v.InferOutput<typeof DashboardDataSchema>;
