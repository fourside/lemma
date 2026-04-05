import * as v from "valibot";

export const TestQuestionSchema = v.object({
  id: v.number(),
  type: v.string(),
  question: v.string(),
  rubric: v.string(),
  max_score: v.number(),
});

export type TestQuestion = v.InferOutput<typeof TestQuestionSchema>;

export const AnswerSchema = v.object({
  questionId: v.number(),
  answer: v.string(),
});

export const GradeTestRequestSchema = v.object({
  answers: v.array(AnswerSchema),
});

export type GradeTestRequest = v.InferOutput<typeof GradeTestRequestSchema>;

export const GradeItemSchema = v.object({
  questionId: v.number(),
  score: v.number(),
  max_score: v.number(),
  feedback: v.string(),
  weak_topics: v.array(v.string()),
});

export type GradeItem = v.InferOutput<typeof GradeItemSchema>;

export const GradeTestResponseSchema = v.object({
  score: v.number(),
  maxScore: v.number(),
  grades: v.array(GradeItemSchema),
  weakTopics: v.array(v.string()),
});

export type GradeTestResponse = v.InferOutput<typeof GradeTestResponseSchema>;

export const WeakpointSchema = v.object({
  topic: v.string(),
  count: v.number(),
  avgScore: v.number(),
  weekIds: v.array(v.number()),
});

export type Weakpoint = v.InferOutput<typeof WeakpointSchema>;
