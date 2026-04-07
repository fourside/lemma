import * as v from "valibot";

export const TestQuestionSchema = v.object({
  id: v.number(),
  type: v.string(),
  question: v.string(),
  rubric: v.string(),
  max_score: v.number(),
});

export type TestQuestion = v.InferOutput<typeof TestQuestionSchema>;

const AnswerSchema = v.object({
  questionId: v.number(),
  answer: v.string(),
});

export const GradeTestRequestSchema = v.object({
  answers: v.array(AnswerSchema),
});

export const WeakpointSchema = v.object({
  topic: v.string(),
  count: v.number(),
  avgScore: v.number(),
  weekIds: v.array(v.number()),
});

export type Weakpoint = v.InferOutput<typeof WeakpointSchema>;
