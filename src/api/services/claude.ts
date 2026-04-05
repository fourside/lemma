import * as v from "valibot";
import type { LectureType } from "../../models/lecture";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const ClaudeResponseSchema = v.object({
  content: v.array(
    v.object({
      type: v.string(),
      text: v.string(),
    }),
  ),
});

export const GradeResultSchema = v.object({
  score: v.number(),
  max_score: v.number(),
  feedback: v.string(),
  weak_topics: v.array(v.string()),
});

export type GradeResult = v.InferOutput<typeof GradeResultSchema>;

async function callClaude(
  system: string,
  userMessage: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const data = v.parse(ClaudeResponseSchema, await res.json());
  const textBlock = data.content.find((b) => b.type === "text");
  if (!textBlock) {
    throw new Error("No text content in Claude response");
  }
  return textBlock.text;
}

export async function generateLectureText(
  weekTitle: string,
  keywords: string,
  type: LectureType,
  apiKey: string,
): Promise<string> {
  const systemPrompt =
    type === "audio"
      ? "あなたはCS講師です。音声講義用のテキストを口語体で生成してください。数式は使わず、3000-5000字で「なぜ重要か」「直感的にどういう話か」を中心に構成してください。"
      : "あなたはCS講師です。テキスト講義資料を生成してください。数式・擬似コード・図・例題・練習問題を含めてください。";

  return callClaude(
    systemPrompt,
    `「${weekTitle}」について講義テキストを生成してください。キーワード: ${keywords}`,
    apiKey,
  );
}

export async function gradeAnswer(
  question: string,
  rubric: string,
  maxScore: number,
  answer: string,
  apiKey: string,
): Promise<GradeResult> {
  const text = await callClaude(
    "あなたはCS講師です。rubric に基づき厳密に採点してください。JSON のみ出力してください。",
    `問題: ${question}\n採点基準: ${rubric}\n配点: ${maxScore}\n学生の回答: ${answer}`,
    apiKey,
  );

  return v.parse(GradeResultSchema, JSON.parse(text));
}
