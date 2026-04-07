import * as v from "valibot";
import { ProgressStatusSchema } from "./week";

export const UpdateProgressRequestSchema = v.object({
  status: ProgressStatusSchema,
  testScore: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100))),
  testNotes: v.optional(v.string()),
});
