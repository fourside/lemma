import * as v from "valibot";
import type { ProgressStatus } from "./week";
import { ProgressStatusSchema } from "./week";

export interface Progress {
  weekId: number;
  status: ProgressStatus;
  testScore: number | null;
  testNotes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export const UpdateProgressRequestSchema = v.object({
  status: ProgressStatusSchema,
  testScore: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100))),
  testNotes: v.optional(v.string()),
});

export type UpdateProgressRequest = v.InferOutput<
  typeof UpdateProgressRequestSchema
>;
