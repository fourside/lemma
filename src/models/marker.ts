import * as v from "valibot";

export const MarkerSchema = v.object({
  id: v.number(),
  weekId: v.number(),
  text: v.string(),
  startOffset: v.number(),
  length: v.number(),
  sectionHeading: v.nullable(v.string()),
  note: v.nullable(v.string()),
  createdAt: v.string(),
});

export type Marker = v.InferOutput<typeof MarkerSchema>;

export const MarkerWithWeekSchema = v.object({
  ...MarkerSchema.entries,
  weekTitle: v.string(),
  courseTitle: v.string(),
});

export type MarkerWithWeek = v.InferOutput<typeof MarkerWithWeekSchema>;

export const CreateMarkerRequestSchema = v.object({
  weekId: v.number(),
  text: v.pipe(v.string(), v.minLength(1)),
  startOffset: v.number(),
  length: v.number(),
  sectionHeading: v.optional(v.nullable(v.string())),
  note: v.optional(v.nullable(v.string())),
});
