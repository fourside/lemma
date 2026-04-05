import * as v from "valibot";

export const LectureTypeSchema = v.picklist(["audio", "text"]);

export type LectureType = v.InferOutput<typeof LectureTypeSchema>;
